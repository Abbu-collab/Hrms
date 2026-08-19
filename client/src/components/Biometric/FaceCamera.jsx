import React, { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "@vladmandic/face-api";
import {
  getRandomChallenge,
  createLivenessState,
  evaluateLivenessFrame,
} from "../../utils/livenessDetector";
import { FiAlertCircle, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

const MODEL_CDN_LOCATIONS = [
  "https://cdn.jsdelivr.net/gh/cddh/face-api.js@master/weights",
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights",
  "/models",
];

let modelsLoadedPromise = null;

const loadFaceApiModels = async () => {
  if (modelsLoadedPromise) return modelsLoadedPromise;

  modelsLoadedPromise = (async () => {
    let loaded = false;
    let lastErr = null;

    for (const url of MODEL_CDN_LOCATIONS) {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(url),
          faceapi.nets.faceLandmark68Net.loadFromUri(url),
          faceapi.nets.faceRecognitionNet.loadFromUri(url),
        ]);
        loaded = true;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`Failed loading face-api models from ${url}:`, err);
      }
    }

    if (!loaded) {
      modelsLoadedPromise = null;
      throw lastErr || new Error("Failed to load face detection models.");
    }
  })();

  return modelsLoadedPromise;
};

export default function FaceCamera({
  onFaceVerified,
  onError,
  mode = "verify", // "verify" or "enroll"
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing camera...");
  const [errorMessage, setErrorMessage] = useState("");

  const [challenge, setChallenge] = useState(() => getRandomChallenge());
  const [livenessState, setLivenessState] = useState(() =>
    createLivenessState(challenge.id)
  );

  const [isVerified, setIsVerified] = useState(false);

  // Stop camera MediaStream tracks safely
  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Track stop error:", e);
        }
      });
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setErrorMessage("");
      setStatusMessage("Loading face detection models...");
      setLoadingModels(true);

      await loadFaceApiModels();
      setLoadingModels(false);

      setStatusMessage("Requesting camera permission...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in your browser.");
      }

      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          // Ignore AbortError when play() is interrupted by React re-render
          if (playErr.name !== "AbortError" && playErr.name !== "NotAllowedError") {
            throw playErr;
          }
        }
        setCameraActive(true);
        setStatusMessage("Looking for face...");
      }
    } catch (err) {
      setLoadingModels(false);
      let msg = "Could not access camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please allow camera access in browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No camera was detected on this device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg = "Camera is currently being used by another application.";
      } else if (err.message && err.name !== "AbortError") {
        msg = err.message;
      }
      if (err.name !== "AbortError") {
        setErrorMessage(msg);
        if (onError) onError(msg);
        stopCamera();
      }
    }
  }, [onError, stopCamera]);

  // Start camera on mount & cleanup on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Detection and Liveness Loop
  useEffect(() => {
    if (!cameraActive || loadingModels || isVerified) return;

    let currentLivenessState = livenessState;

    timerRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const displaySize = {
        width: video.videoWidth || 640,
        height: video.videoHeight || 480,
      };

      if (displaySize.width === 0 || displaySize.height === 0) return;

      faceapi.matchDimensions(canvas, displaySize);

      try {
        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.4,
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, displaySize.width, displaySize.height);

        if (!detection) {
          setStatusMessage("Looking for face... Position face in frame.");
          return;
        }

        const resizedDetection = faceapi.resizeResults(detection, displaySize);

        // Draw landmarks & bounding box guide
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

        // Quality and positioning checks (lenient thresholds)
        const box = resizedDetection.detection.box;
        const faceHeightRatio = box.height / displaySize.height;

        if (faceHeightRatio < 0.10) {
          setStatusMessage("Please move closer to the camera.");
          return;
        }

        if (faceHeightRatio > 0.92) {
          setStatusMessage("Please step back slightly.");
          return;
        }

        // Evaluate active liveness
        const nextLivenessState = evaluateLivenessFrame(
          resizedDetection.landmarks,
          currentLivenessState
        );

        currentLivenessState = nextLivenessState;
        setLivenessState(nextLivenessState);

        if (!nextLivenessState.isPassed) {
          setStatusMessage(`Liveness Prompt: ${challenge.instruction}`);
        } else {
          // Liveness Passed!
          setIsVerified(true);
          setStatusMessage("Liveness verified ✓ Processing face profile...");
          stopCamera();

          const descriptor = Array.from(detection.descriptor);
          onFaceVerified(descriptor);
        }
      } catch (err) {
        console.warn("Face detection error:", err);
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cameraActive, loadingModels, isVerified, challenge, livenessState, onFaceVerified, stopCamera]);

  const handleRetry = () => {
    setIsVerified(false);
    const newChallenge = getRandomChallenge();
    setChallenge(newChallenge);
    setLivenessState(createLivenessState(newChallenge.id));
    startCamera();
  };

  return (
    <div className="face-camera-container">
      {errorMessage ? (
        <div className="face-camera-error-box">
          <FiAlertCircle size={36} className="face-camera-error-icon" />
          <p className="face-camera-error-text">{errorMessage}</p>
          <button
            type="button"
            className="face-camera-btn-retry"
            onClick={handleRetry}
          >
            <FiRefreshCw size={14} /> Retry Camera
          </button>
        </div>
      ) : (
        <div className="face-camera-viewport">
          <video
            ref={videoRef}
            className="face-camera-video"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="face-camera-canvas" />

          {/* Oval Face Alignment Guide Overlay */}
          <div className="face-camera-overlay-oval">
            <div className={`face-camera-oval-ring ${livenessState.isPassed ? "passed" : ""}`} />
          </div>

          {/* Status Overlay Banner */}
          <div className="face-camera-status-banner">
            {loadingModels ? (
              <span className="face-camera-status-text">
                <span className="face-camera-spinner" /> Loading Face AI Models...
              </span>
            ) : isVerified ? (
              <span className="face-camera-status-text success">
                <FiCheckCircle size={16} /> Identity & Liveness Verified
              </span>
            ) : (
              <span className="face-camera-status-text">
                {statusMessage}
              </span>
            )}
          </div>

          {/* Liveness Progress Bar */}
          {!isVerified && !loadingModels && (
            <div className="face-camera-liveness-bar-wrap">
              <div className="face-camera-liveness-label">
                Challenge: <strong>{challenge.title}</strong> ({Math.round(livenessState.progress)}%)
              </div>
              <div className="face-camera-progress-track">
                <div
                  className="face-camera-progress-fill"
                  style={{ width: `${livenessState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

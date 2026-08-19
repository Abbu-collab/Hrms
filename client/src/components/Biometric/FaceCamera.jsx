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

// Helper: Average an array of 128-float descriptor vectors element-wise
const averageDescriptors = (descriptors) => {
  if (!descriptors || descriptors.length === 0) return null;
  const len = descriptors[0].length;
  const avg = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (let j = 0; j < descriptors.length; j++) {
      sum += descriptors[j][i];
    }
    avg[i] = sum / descriptors.length;
  }
  return Array.from(avg);
};

export default function FaceCamera({
  onFaceVerified,
  onError,
  mode = "verify", // "verify" or "enroll"
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Persistent refs across camera session
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isLoopRunningRef = useRef(false);
  const isVerifiedRef = useRef(false);

  // State refs for detection loop (prevents re-instantiating detection loop)
  const challengeRef = useRef(getRandomChallenge());
  const livenessStateRef = useRef(createLivenessState(challengeRef.current.id));
  const validDescriptorsRef = useRef([]);

  // React state for UI rendering only
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing camera...");
  const [errorMessage, setErrorMessage] = useState("");

  const [challenge, setChallenge] = useState(challengeRef.current);
  const [progress, setProgress] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Stop camera MediaStream tracks safely
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isLoopRunningRef.current = false;

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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Single Camera Initialization (ONCE per session)
  const initCamera = useCallback(async () => {
    if (streamRef.current) return;

    try {
      setErrorMessage("");
      setStatusMessage("Loading face AI models...");
      setLoadingModels(true);

      await loadFaceApiModels();
      setLoadingModels(false);

      setStatusMessage("Requesting camera permission...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in your browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        // Safari requires muted to be set on the element directly before play
        video.muted = true;
        video.srcObject = stream;
        video.playsInline = true;
        try {
          await video.play();
        } catch (playErr) {
          if (playErr.name !== "AbortError" && playErr.name !== "NotAllowedError") {
            throw playErr;
          }
        }
        setCameraActive(true);
        setStatusMessage("Position face in frame...");
      }
    } catch (err) {
      setLoadingModels(false);
      let msg = "Could not access camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission denied. Please enable camera access in browser settings.";
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

  // Continuous Detection Loop (Managed via single animationFrame loop)
  const startDetectionLoop = useCallback(() => {
    if (isLoopRunningRef.current) return;
    isLoopRunningRef.current = true;

    let lastFrameTime = 0;

    const detectFrame = async (timestamp) => {
      if (!isLoopRunningRef.current || isVerifiedRef.current) return;

      // Throttle detection to ~10-12 FPS (every 85ms) for smooth CPU performance
      if (timestamp - lastFrameTime > 85) {
        lastFrameTime = timestamp;

        if (
          videoRef.current &&
          canvasRef.current &&
          !videoRef.current.paused &&
          !videoRef.current.ended
        ) {
          const video = videoRef.current;
          const canvas = canvasRef.current;

          const displaySize = {
            width: video.videoWidth || 640,
            height: video.videoHeight || 480,
          };

          if (displaySize.width > 0 && displaySize.height > 0) {
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
                setStatusMessage("Looking for face... Position face inside frame.");
              } else {
                const resizedDetection = faceapi.resizeResults(detection, displaySize);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

                const box = resizedDetection.detection.box;
                const faceHeightRatio = box.height / displaySize.height;

                if (faceHeightRatio < 0.10) {
                  setStatusMessage("Please move closer to the camera.");
                } else if (faceHeightRatio > 0.92) {
                  setStatusMessage("Please step back slightly.");
                } else {
                  // Evaluate active liveness
                  const nextState = evaluateLivenessFrame(
                    resizedDetection.landmarks,
                    livenessStateRef.current,
                    challengeRef.current
                  );

                  livenessStateRef.current = nextState;
                  setProgress(Math.round(nextState.progress));

                  if (!nextState.isPassed) {
                    setStatusMessage(`Liveness Prompt: ${challengeRef.current.instruction}`);
                  } else {
                    // Liveness Passed! Collect sample(s)
                    validDescriptorsRef.current.push(Array.from(detection.descriptor));

                    const requiredSamples = mode === "enroll" ? 4 : 1;

                    if (validDescriptorsRef.current.length >= requiredSamples) {
                      isVerifiedRef.current = true;
                      setIsVerified(true);
                      setStatusMessage("Liveness & face verification passed ✓");

                      stopCamera();

                      const finalDescriptor =
                        mode === "enroll"
                          ? averageDescriptors(validDescriptorsRef.current)
                          : validDescriptorsRef.current[0];

                      onFaceVerified(finalDescriptor);
                      return;
                    } else {
                      setStatusMessage(
                        `Collecting face samples (${validDescriptorsRef.current.length}/${requiredSamples})...`
                      );
                    }
                  }
                }
              }
            } catch (err) {
              console.warn("Face detection frame error:", err);
            }
          }
        }
      }

      if (isLoopRunningRef.current && !isVerifiedRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(detectFrame);
  }, [mode, onFaceVerified, stopCamera]);

  // Start camera on mount & start loop when camera is active
  useEffect(() => {
    initCamera();
    return () => {
      stopCamera();
    };
  }, [initCamera, stopCamera]);

  useEffect(() => {
    if (cameraActive && !loadingModels && !isVerified) {
      startDetectionLoop();
    }
  }, [cameraActive, loadingModels, isVerified, startDetectionLoop]);

  const handleRetry = () => {
    isVerifiedRef.current = false;
    setIsVerified(false);
    validDescriptorsRef.current = [];

    const newChallenge = getRandomChallenge();
    challengeRef.current = newChallenge;
    livenessStateRef.current = createLivenessState(newChallenge.id);

    setChallenge(newChallenge);
    setProgress(0);
    initCamera();
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
            autoPlay
            muted
          />
          <canvas ref={canvasRef} className="face-camera-canvas" />

          {/* Oval Face Alignment Guide Overlay */}
          <div className="face-camera-overlay-oval">
            <div className={`face-camera-oval-ring ${isVerified ? "passed" : ""}`} />
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
                Challenge: <strong>{challenge.title}</strong> ({progress}%)
              </div>
              <div className="face-camera-progress-track">
                <div
                  className="face-camera-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

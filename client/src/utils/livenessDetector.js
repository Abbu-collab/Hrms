// Liveness detection helper using 68-point facial landmarks

const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

// Calculate Eye Aspect Ratio (EAR)
export const calculateEAR = (landmarks) => {
  const pts = landmarks.positions || landmarks;
  if (!pts || pts.length < 48) return 0.3;

  // Left eye landmarks: 36..41
  const leftEye = [pts[36], pts[37], pts[38], pts[39], pts[40], pts[41]];
  // Right eye landmarks: 42..47
  const rightEye = [pts[42], pts[43], pts[44], pts[45], pts[46], pts[47]];

  const getEyeEAR = (eye) => {
    const v1 = dist(eye[1], eye[5]);
    const v2 = dist(eye[2], eye[4]);
    const h = dist(eye[0], eye[3]);
    return h === 0 ? 0.3 : (v1 + v2) / (2.0 * h);
  };

  const leftEAR = getEyeEAR(leftEye);
  const rightEAR = getEyeEAR(rightEye);

  return (leftEAR + rightEAR) / 2.0;
};

// Calculate Normalized Nose Offset across Jaw width (0.0 to 1.0, center ~ 0.50)
export const calculateNoseOffset = (landmarks) => {
  const pts = landmarks.positions || landmarks;
  if (!pts || pts.length < 31) return 0.5;

  const jawLeft = pts[0];
  const jawRight = pts[16];
  const noseTip = pts[30];

  const minX = Math.min(jawLeft.x, jawRight.x);
  const maxX = Math.max(jawLeft.x, jawRight.x);
  const totalWidth = maxX - minX;

  if (totalWidth === 0) return 0.5;
  return (noseTip.x - minX) / totalWidth;
};

export const CHALLENGES = {
  BLINK: {
    id: "BLINK",
    title: "Blink Eyes",
    instruction: "Please blink your eyes naturally.",
  },
  TURN_LEFT: {
    id: "TURN_LEFT",
    title: "Turn Head Left",
    instruction: "Please turn your head slightly to the left.",
  },
  TURN_RIGHT: {
    id: "TURN_RIGHT",
    title: "Turn Head Right",
    instruction: "Please turn your head slightly to the right.",
  },
};

export const getRandomChallenge = () => {
  const keys = Object.keys(CHALLENGES);
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  return CHALLENGES[selectedKey];
};

export const createLivenessState = (challengeId) => ({
  challengeId,
  blinkCount: 0,
  eyeWasClosed: false,
  turnFrames: 0,
  isPassed: false,
  progress: 0, // 0 to 100
});

export const evaluateLivenessFrame = (landmarks, state) => {
  if (state.isPassed) return state;

  const newState = { ...state };
  const ear = calculateEAR(landmarks);
  const offset = calculateNoseOffset(landmarks);

  if (state.challengeId === "BLINK") {
    // EAR threshold for closed eyes: < 0.22; for open eyes: > 0.24
    if (ear < 0.22 && !state.eyeWasClosed) {
      newState.eyeWasClosed = true;
    } else if (ear > 0.24 && state.eyeWasClosed) {
      newState.eyeWasClosed = false;
      newState.blinkCount = state.blinkCount + 1;
      newState.progress = Math.min(100, (newState.blinkCount / 1) * 100);

      if (newState.blinkCount >= 1) {
        newState.isPassed = true;
        newState.progress = 100;
      }
    }
  } else if (state.challengeId === "TURN_LEFT") {
    // Turning head left shifts nose offset away from center (< 0.38 or > 0.62)
    if (offset < 0.38 || offset > 0.62) {
      newState.turnFrames = state.turnFrames + 1;
      newState.progress = Math.min(100, (newState.turnFrames / 2) * 100);
      if (newState.turnFrames >= 2) {
        newState.isPassed = true;
        newState.progress = 100;
      }
    }
  } else if (state.challengeId === "TURN_RIGHT") {
    // Turning head right shifts nose offset away from center (< 0.38 or > 0.62)
    if (offset < 0.38 || offset > 0.62) {
      newState.turnFrames = state.turnFrames + 1;
      newState.progress = Math.min(100, (newState.turnFrames / 2) * 100);
      if (newState.turnFrames >= 2) {
        newState.isPassed = true;
        newState.progress = 100;
      }
    }
  }

  return newState;
};

// Temporal Liveness Detection Helper using 68-point facial landmarks

const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

// Calculate Eye Aspect Ratio (EAR) across both eyes
export const calculateEAR = (landmarks) => {
  const pts = landmarks.positions || landmarks;
  if (!pts || pts.length < 48) return 0.3;

  // Left eye: 36..41, Right eye: 42..47
  const leftEye = [pts[36], pts[37], pts[38], pts[39], pts[40], pts[41]];
  const rightEye = [pts[42], pts[43], pts[44], pts[45], pts[46], pts[47]];

  const getEyeEAR = (eye) => {
    const v1 = dist(eye[1], eye[5]);
    const v2 = dist(eye[2], eye[4]);
    const h = dist(eye[0], eye[3]);
    return h === 0 ? 0.3 : (v1 + v2) / (2.0 * h);
  };

  return (getEyeEAR(leftEye) + getEyeEAR(rightEye)) / 2.0;
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
    title: "Blink Twice",
    instruction: "Please blink your eyes naturally.",
    targetCount: 2,
  },
  TURN_LEFT: {
    id: "TURN_LEFT",
    title: "Turn Head Left",
    instruction: "Please turn your head slightly to the left.",
    targetCount: 3,
  },
  TURN_RIGHT: {
    id: "TURN_RIGHT",
    title: "Turn Head Right",
    instruction: "Please turn your head slightly to the right.",
    targetCount: 3,
  },
};

export const getRandomChallenge = () => {
  const keys = Object.keys(CHALLENGES);
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  return CHALLENGES[selectedKey];
};

export const createLivenessState = (challengeId) => ({
  challengeId,
  // Temporal state machine for blink
  blinkPhase: "OPEN", // "OPEN" | "CLOSING" | "CLOSED"
  closedFrames: 0,
  blinkCount: 0,
  lastBlinkTime: 0,

  // Temporal state machine for head turn
  turnFrames: 0,

  isPassed: false,
  progress: 0, // 0 to 100
});

export const evaluateLivenessFrame = (landmarks, state, challengeConfig) => {
  if (state.isPassed) return state;

  const now = Date.now();
  const newState = { ...state };
  const ear = calculateEAR(landmarks);
  const offset = calculateNoseOffset(landmarks);

  const targetCount = challengeConfig?.targetCount || 2;

  if (state.challengeId === "BLINK") {
    // Cooldown check (400ms after last blink)
    if (now - state.lastBlinkTime < 400) {
      return state;
    }

    const CLOSED_THRESHOLD = 0.20;
    const OPEN_THRESHOLD = 0.25;

    if (state.blinkPhase === "OPEN") {
      if (ear < CLOSED_THRESHOLD) {
        newState.blinkPhase = "CLOSING";
        newState.closedFrames = 1;
      }
    } else if (state.blinkPhase === "CLOSING") {
      if (ear < CLOSED_THRESHOLD) {
        newState.closedFrames = state.closedFrames + 1;
        if (newState.closedFrames >= 2) {
          newState.blinkPhase = "CLOSED";
        }
      } else {
        newState.blinkPhase = "OPEN";
        newState.closedFrames = 0;
      }
    } else if (state.blinkPhase === "CLOSED") {
      if (ear > OPEN_THRESHOLD) {
        // Valid blink completed!
        newState.blinkPhase = "OPEN";
        newState.closedFrames = 0;
        newState.blinkCount = state.blinkCount + 1;
        newState.lastBlinkTime = now;
        newState.progress = Math.min(100, (newState.blinkCount / targetCount) * 100);

        if (newState.blinkCount >= targetCount) {
          newState.isPassed = true;
          newState.progress = 100;
        }
      }
    }
  } else if (state.challengeId === "TURN_LEFT") {
    // Turning head left shifts nose offset away from center (< 0.38 or > 0.62)
    if (offset < 0.38 || offset > 0.62) {
      newState.turnFrames = state.turnFrames + 1;
      newState.progress = Math.min(100, (newState.turnFrames / targetCount) * 100);
      if (newState.turnFrames >= targetCount) {
        newState.isPassed = true;
        newState.progress = 100;
      }
    }
  } else if (state.challengeId === "TURN_RIGHT") {
    // Turning head right shifts nose offset away from center (< 0.38 or > 0.62)
    if (offset < 0.38 || offset > 0.62) {
      newState.turnFrames = state.turnFrames + 1;
      newState.progress = Math.min(100, (newState.turnFrames / targetCount) * 100);
      if (newState.turnFrames >= targetCount) {
        newState.isPassed = true;
        newState.progress = 100;
      }
    }
  }

  return newState;
};

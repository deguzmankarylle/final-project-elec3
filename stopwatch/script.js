"use strict";

/**
 * Modern Stopwatch Application
 * Refactored with improved structure and better maintainability
 */

// ===== DOM Elements =====
const domElements = {
  time: document.getElementById("time"),
  startPause: document.getElementById("startPause"),
  reset: document.getElementById("reset"),
};

// ===== Stopwatch State =====
const stopwatchState = {
  isRunning: false,
  startPerformanceTime: 0,
  accumulatedTime: 0,
  rafId: 0,
};

// ===== Time Formatting =====

/**
 * Format milliseconds to HH:MM:SS.CS format
 */
function formatTime(milliseconds) {
  const totalCentiseconds = Math.floor(milliseconds / 10);
  const centiseconds = totalCentiseconds % 100;

  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;

  const hours = Math.floor(totalMinutes / 60);

  return (
    String(hours).padStart(2, "0") + ":" +
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0") + "." +
    String(centiseconds).padStart(2, "0")
  );
}

/**
 * Update the display with current time
 */
function updateDisplay(milliseconds) {
  domElements.time.textContent = formatTime(milliseconds);
}

/**
 * Update button states based on stopwatch state
 */
function updateButtonStates() {
  const { isRunning, accumulatedTime } = stopwatchState;

  if (isRunning) {
    domElements.startPause.textContent = "Pause";
  } else if (accumulatedTime > 0) {
    domElements.startPause.textContent = "Resume";
  } else {
    domElements.startPause.textContent = "Start";
  }

  domElements.reset.disabled = isRunning || accumulatedTime === 0;
}

// ===== Animation Frame Handler =====

/**
 * Main animation loop for smooth updates
 */
function animationTick() {
  if (!stopwatchState.isRunning) return;

  const now = performance.now();
  const currentTime = stopwatchState.accumulatedTime + (now - stopwatchState.startPerformanceTime);

  updateDisplay(currentTime);
  stopwatchState.rafId = requestAnimationFrame(animationTick);
}

// ===== Control Functions =====

/**
 * Start the stopwatch
 */
function startStopwatch() {
  if (stopwatchState.isRunning) return;

  stopwatchState.isRunning = true;
  stopwatchState.startPerformanceTime = performance.now();

  if (!stopwatchState.rafId) {
    stopwatchState.rafId = requestAnimationFrame(animationTick);
  }

  updateButtonStates();
}

/**
 * Pause the stopwatch
 */
function pauseStopwatch() {
  if (!stopwatchState.isRunning) return;

  stopwatchState.isRunning = false;

  if (stopwatchState.rafId) {
    cancelAnimationFrame(stopwatchState.rafId);
  }
  stopwatchState.rafId = 0;

  stopwatchState.accumulatedTime += performance.now() - stopwatchState.startPerformanceTime;
  updateDisplay(stopwatchState.accumulatedTime);
  updateButtonStates();
}

/**
 * Reset the stopwatch
 */
function resetStopwatch() {
  if (stopwatchState.isRunning) return;

  if (stopwatchState.rafId) {
    cancelAnimationFrame(stopwatchState.rafId);
  }
  stopwatchState.rafId = 0;

  stopwatchState.startPerformanceTime = 0;
  stopwatchState.accumulatedTime = 0;

  updateDisplay(0);
  updateButtonStates();
}

/**
 * Toggle between start/pause
 */
function toggleStartPause() {
  if (stopwatchState.isRunning) {
    pauseStopwatch();
  } else {
    startStopwatch();
  }
}

// ===== Event Listeners =====

domElements.startPause.addEventListener("click", toggleStartPause);
domElements.reset.addEventListener("click", resetStopwatch);

/**
 * Keyboard controls
 */
document.addEventListener("keydown", (event) => {
  const { key } = event;
  const isSpace = key === " " || event.code === "Space";

  if (isSpace) {
    event.preventDefault();
    toggleStartPause();
    return;
  }

  if (key.toLowerCase() === "r") {
    resetStopwatch();
  }
});

/**
 * Handle visibility change (pause when tab is hidden to save resources)
 */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && stopwatchState.isRunning) {
    stopwatchState.accumulatedTime += performance.now() - stopwatchState.startPerformanceTime;
    stopwatchState.startPerformanceTime = performance.now();
    updateDisplay(stopwatchState.accumulatedTime);

    if (stopwatchState.rafId) {
      cancelAnimationFrame(stopwatchState.rafId);
      stopwatchState.rafId = 0;
    }
  } else if (!document.hidden && stopwatchState.isRunning && !stopwatchState.rafId) {
    stopwatchState.startPerformanceTime = performance.now();
    stopwatchState.rafId = requestAnimationFrame(animationTick);
  }
});

// ===== Initialize =====
updateDisplay(0);
updateButtonStates();

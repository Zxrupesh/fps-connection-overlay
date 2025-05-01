let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

// Create overlay
const overlay = document.createElement("div");
overlay.id = "fps-connection-overlay";
overlay.style.position = "fixed";
overlay.style.top = "10px";   // default position
overlay.style.left = "10px";
overlay.style.background = "rgba(0, 0, 0, 0.75)";
overlay.style.color = "#0f0";
overlay.style.padding = "10px";
overlay.style.borderRadius = "8px";
overlay.style.zIndex = "999999";
overlay.style.cursor = "move";
overlay.style.userSelect = "none";
overlay.style.fontFamily = "monospace";
overlay.style.fontSize = "14px";
overlay.style.maxWidth = "200px";
overlay.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
overlay.innerHTML = "Loading...";

// Append to document
document.body.appendChild(overlay);

// Load saved position
try {
  chrome.storage.sync.get(['overlayPosition'], (res) => {
    if (res.overlayPosition) {
      overlay.style.top = res.overlayPosition.top || "10px";
      overlay.style.left = res.overlayPosition.left || "10px";
    }
  });
} catch (e) {
  console.warn("Failed to load saved overlay position:", e);
}

// FPS tracker
function updateOverlay() {
  overlay.innerHTML = `
    <strong>FPS:</strong> ${fps}<br>
    <strong>Connection:</strong> ${getConnectionInfo()}
  `;
}

function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    return `${conn.effectiveType}, ${conn.downlink} Mbps, ${conn.rtt} ms`;
  }
  return "Unavailable";
}

function trackFPS(now) {
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = now;
    updateOverlay();
  }
  requestAnimationFrame(trackFPS);
}
requestAnimationFrame(trackFPS);

// Make overlay draggable and save position
let isDragging = false;
let offsetX = 0, offsetY = 0;

overlay.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - overlay.offsetLeft;
  offsetY = e.clientY - overlay.offsetTop;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    overlay.style.left = `${e.clientX - offsetX}px`;
    overlay.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    try {
      chrome.storage.sync.set({
        overlayPosition: {
          top: overlay.style.top,
          left: overlay.style.left
        }
      });
    } catch (e) {
      console.warn("Could not save position:", e);
    }
  }
});

// Show/hide based on user toggle
try {
  chrome.storage?.sync.get(['showOverlay'], (res) => {
    overlay.style.display = res.showOverlay === false ? "none" : "block";
  });
} catch (e) {
  console.warn("Could not get overlay visibility setting:", e);
}


let hideTimeout;

function resetAutoHideTimer() {
  overlay.style.display = 'block';
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    overlay.style.display = 'none';
  }, 30000); // 30 seconds
}

// Track mouse movement
document.addEventListener('mousemove', resetAutoHideTimer);

// Start timer immediately
resetAutoHideTimer();

const intro = document.getElementById("intro");
const mapScreen = document.getElementById("mapScreen");
const map = document.getElementById("map");
const mapWorld = document.getElementById("mapWorld");
const rider = document.getElementById("rider");
const overlay = document.getElementById("readingOverlay");
const musicPrompt = document.getElementById("musicPrompt");
const nodeLabel = document.getElementById("nodeLabel");
const nodeTitle = document.getElementById("nodeTitle");
const nodeText = document.getElementById("nodeText");
const continueButton = document.getElementById("continueButton");
const beginButton = document.getElementById("beginButton");
const enableMusicButton = document.getElementById("enableMusicButton");
const skipMusicButton = document.getElementById("skipMusicButton");
const musicToggleButton = document.getElementById("musicToggleButton");
const musicToggleText = document.getElementById("musicToggleText");
const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const readingPanel = document.querySelector(".reading-panel");
const riderBody = document.querySelector(".rider-body");
const completionCard = document.getElementById("completionCard");
const safeBgm = document.getElementById("safeBgm");
const dangerBgm = document.getElementById("dangerBgm");
const nodeEditor = document.getElementById("nodeEditor");
const saveNodesButton = document.getElementById("saveNodesButton");
const copyNodesButton = document.getElementById("copyNodesButton");
const resetNodesButton = document.getElementById("resetNodesButton");
const nodeOutput = document.getElementById("nodeOutput");
const nodeButtons = Array.from(document.querySelectorAll(".node"));
const editorMode = new URLSearchParams(window.location.search).has("edit");
const nodeStorageKey = "little-red-riding-hood-node-positions";

const storyNodes = {
  home: {
    label: "Node 1",
    title: "At Home",
    scene: "home",
    x: 16.2,
    y: 85.6,
    text: [
      "Once upon a time there was a dear little girl who was loved by every one who looked at her, but most of all by her grandmother.",
      "Once she gave her a little cap of red velvet, which suited her so well that she would never wear anything else. So she was always called Little Red-Cap.",
      "One day her mother said to her, \"Come, Little Red-Cap, here is a piece of cake and a bottle of wine. Take them to your grandmother; she is ill and weak, and they will do her good.\"",
      "\"Set out before it gets hot, and when you are going, walk nicely and quietly and do not run off the path.\"",
    ],
  },
  forest: {
    label: "Node 2",
    title: "Into the Wood",
    scene: "forest",
    x: 29.8,
    y: 80.4,
    text: [
      "The grandmother lived out in the wood, half a league from the village. As soon as Little Red-Cap entered the wood, a wolf met her.",
      "Little Red-Cap did not know what a wicked creature he was, and was not at all afraid of him.",
      "\"Good day, Little Red-Cap,\" said he. \"Thank you kindly, wolf.\"",
      "\"Whither away so early, Little Red-Cap?\" \"To my grandmother's.\"",
    ],
  },
  flowers: {
    label: "Node 3",
    title: "The Flowers",
    scene: "flowers",
    x: 53.2,
    y: 68.4,
    text: [
      "The wolf thought to himself, \"What a tender young creature. What a nice plump mouthful; she will be better to eat than the old woman.\"",
      "Then he walked for a short time by the side of Little Red-Cap, and said, \"See, Little Red-Cap, how pretty the flowers are about here. Why do you not look round?\"",
      "Little Red-Cap raised her eyes, and when she saw the sunbeams dancing here and there through the trees, and pretty flowers growing everywhere, she thought, \"Suppose I take grandmother a fresh nosegay.\"",
      "So she ran from the path into the wood to look for flowers.",
    ],
  },
  wolf: {
    label: "Node 4",
    title: "Mr. Wolf",
    scene: "wolf",
    x: 73,
    y: 49.6,
    text: [
      "The wolf ran straight to the grandmother's house and knocked at the door.",
      "\"Who is there?\" \"Little Red-Cap,\" replied the wolf. \"She is bringing cake and wine; open the door.\"",
      "\"Lift the latch,\" called out the grandmother, \"I am too weak, and cannot get up.\"",
      "The wolf lifted the latch, the door sprang open, and without saying a word he went straight to the grandmother's bed, and devoured her.",
      "Then he put on her clothes, dressed himself in her cap, laid himself in bed, and drew the curtains.",
    ],
  },
  cottage: {
    label: "Node 5",
    title: "Grandmother's Bed",
    scene: "cottage",
    x: 84.5,
    y: 31.9,
    text: [
      "Little Red-Cap gathered so many flowers that she could carry no more, and then she remembered her grandmother and set out on the way to her.",
      "She was surprised to find the cottage door standing open. When she went into the room, she had such a strange feeling that she said to herself, \"Oh dear, how uneasy I feel today.\"",
      "She went to the bed and drew back the curtains. There lay her grandmother with her cap pulled far over her face, and looking very strange.",
      "\"Oh, grandmother,\" she said, \"what big ears you have.\" \"The better to hear you with, my child.\"",
      "\"But, grandmother, what big eyes you have.\" \"The better to see you with, my dear.\"",
      "\"But, grandmother, what a terrible big mouth you have.\" \"The better to eat you with.\"",
      "And scarcely had the wolf said this than with one bound he was out of bed and swallowed up Little Red-Cap.",
    ],
  },
  ending: {
    label: "Node 6",
    title: "The Rescue",
    scene: "ending",
    x: 84.5,
    y: 31.9,
    text: [
      "When the wolf had appeased his appetite, he lay down again in the bed, fell asleep and began to snore very loud.",
      "A huntsman was just passing the house, and thought to himself, \"How the old woman is snoring. I must see if she wants anything.\"",
      "He saw that the wolf was lying in the bed. \"Do I find you here, you old sinner,\" said he. \"I have long sought you.\"",
      "He took a pair of scissors and began to cut open the stomach of the sleeping wolf. After a few cuts, Little Red-Cap sprang out, crying, \"Ah, how frightened I have been.\"",
      "Afterwards the aged grandmother came out alive also. Little Red-Cap fetched great stones; they filled the wolf's body with them, and when he awoke he fell down dead.",
      "Then all three were delighted. Little Red-Cap thought to herself, \"As long as I live, I will never by myself leave the path, to run into the wood, when my mother has forbidden me to do so.\"",
    ],
  },
};

const nodeOrder = ["home", "forest", "flowers", "wolf", "cottage", "ending"];
const defaultNodePositions = Object.fromEntries(
  nodeOrder.map((id) => [id, { x: storyNodes[id].x, y: storyNodes[id].y }])
);
const visited = new Set();
const keys = new Set();
const position = { x: 16.2, y: 85.6 };
const velocity = { x: 0, y: 0 };
const joystickVector = { x: 0, y: 0 };

let activeNode = null;
let unlockedIndex = 0;
let storyComplete = false;
let lastFrame = performance.now();
let mapActive = false;
let musicEnabled = false;
const audioFades = new Map();
const musicCrossfadeMs = 2800;
const musicStopFadeMs = 1500;

function setRiderPosition() {
  rider.style.left = `${position.x}%`;
  rider.style.top = `${position.y}%`;
  updateCamera();
}

function updateCamera() {
  if (!mapWorld) return;

  const viewport = map.getBoundingClientRect();
  const world = mapWorld.getBoundingClientRect();
  if (world.width <= viewport.width && world.height <= viewport.height) {
    mapWorld.style.setProperty("--camera-x", "0px");
    mapWorld.style.setProperty("--camera-y", "0px");
    return;
  }

  const riderX = (position.x / 100) * world.width;
  const riderY = (position.y / 100) * world.height;
  const targetX = clamp(viewport.width / 2 - riderX, viewport.width - world.width, 0);
  const targetY = clamp(viewport.height / 2 - riderY, viewport.height - world.height, 0);
  mapWorld.style.setProperty("--camera-x", `${targetX}px`);
  mapWorld.style.setProperty("--camera-y", `${targetY}px`);
}

function dismissMusicPrompt() {
  musicPrompt.classList.remove("is-active");
  musicPrompt.setAttribute("aria-hidden", "true");
  musicPrompt.hidden = true;
}

function getNodeButton(id) {
  return nodeButtons.find((button) => button.dataset.node === id);
}

function setNodePosition(id, x, y, syncRider = false) {
  const node = storyNodes[id];
  const button = getNodeButton(id);
  if (!node) return;

  const nextX = Number(clamp(x, 2, 98).toFixed(1));
  const nextY = Number(clamp(y, 5, 95).toFixed(1));
  node.x = nextX;
  node.y = nextY;
  if (id === "cottage" && storyNodes.ending) {
    storyNodes.ending.x = nextX;
    storyNodes.ending.y = nextY;
  }
  if (button) {
    button.style.left = `${nextX}%`;
    button.style.top = `${nextY}%`;
  }

  if (syncRider || id === "home") {
    position.x = nextX;
    position.y = nextY;
    setRiderPosition();
  }
}

function getNodePositions() {
  return Object.fromEntries(
    nodeOrder.map((id) => [id, { x: storyNodes[id].x, y: storyNodes[id].y }])
  );
}

function formatNodePositions() {
  const positions = getNodePositions();
  const appCoordinates = nodeOrder
    .map((id) => `  ${id}: { x: ${positions[id].x}, y: ${positions[id].y} },`)
    .join("\n");
  const htmlCoordinates = nodeOrder
    .filter((id) => id !== "ending")
    .map((id) => {
      const node = positions[id];
      return `${id}: left: ${node.x}%; top: ${node.y}%;`;
    })
    .join("\n");

  return `app.js coordinates:\n${appCoordinates}\n\nindex.html button styles:\n${htmlCoordinates}`;
}

function renderNodeOutput(message = "") {
  if (!nodeOutput) return;
  nodeOutput.value = `${message ? `${message}\n\n` : ""}${formatNodePositions()}`;
}

function applySavedNodePositions() {
  const saved = localStorage.getItem(nodeStorageKey);
  if (!saved) return;

  try {
    const positions = JSON.parse(saved);
    Object.entries(positions).forEach(([id, point]) => {
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
        setNodePosition(id, point.x, point.y);
      }
    });
  } catch {
    localStorage.removeItem(nodeStorageKey);
  }
}

function saveNodePositions() {
  localStorage.setItem(nodeStorageKey, JSON.stringify(getNodePositions()));
  renderNodeOutput("Saved in this browser. Copy the coordinates below if you want to make them permanent in the code.");
}

function resetNodePositions() {
  localStorage.removeItem(nodeStorageKey);
  Object.entries(defaultNodePositions).forEach(([id, point]) => {
    setNodePosition(id, point.x, point.y, id === "home");
  });
  renderNodeOutput("Reset to the original code positions.");
}

function unlockAllNodesForEditor() {
  nodeButtons.forEach((button) => {
    button.classList.remove("is-locked");
    button.classList.add("is-unlocked");
    button.disabled = false;
    button.setAttribute("aria-disabled", "false");
  });
}

function setupNodeEditor() {
  if (!editorMode || !nodeEditor) return;

  document.body.classList.add("editor-mode");
  map.classList.add("is-editing");
  nodeEditor.hidden = false;
  unlockAllNodesForEditor();
  renderNodeOutput("Editor mode is active. Drag the story points, then save.");

  nodeButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const id = button.dataset.node;
      button.classList.add("is-dragging");
      button.setPointerCapture(event.pointerId);

      function moveNode(pointerEvent) {
        const rect = mapWorld.getBoundingClientRect();
        const x = ((pointerEvent.clientX - rect.left) / rect.width) * 100;
        const y = ((pointerEvent.clientY - rect.top) / rect.height) * 100;
        setNodePosition(id, x, y, id === "home");
        renderNodeOutput();
      }

      function stopDragging(pointerEvent) {
        button.classList.remove("is-dragging");
        if (button.hasPointerCapture(pointerEvent.pointerId)) {
          button.releasePointerCapture(pointerEvent.pointerId);
        }
        button.removeEventListener("pointermove", moveNode);
        button.removeEventListener("pointerup", stopDragging);
        button.removeEventListener("pointercancel", stopDragging);
        renderNodeOutput("Position updated. Click Save if this is correct.");
      }

      button.addEventListener("pointermove", moveNode);
      button.addEventListener("pointerup", stopDragging);
      button.addEventListener("pointercancel", stopDragging);
    });
  });

  saveNodesButton?.addEventListener("click", saveNodePositions);
  resetNodesButton?.addEventListener("click", resetNodePositions);
  copyNodesButton?.addEventListener("click", () => {
    if (!navigator.clipboard?.writeText) {
      renderNodeOutput("Clipboard access failed. Select and copy the text manually.");
      nodeOutput?.select();
      return;
    }

    navigator.clipboard.writeText(formatNodePositions()).then(() => {
      renderNodeOutput("Copied coordinates to clipboard.");
    }).catch(() => {
      renderNodeOutput("Clipboard access failed. Select and copy the text manually.");
      nodeOutput?.select();
    });
  });
}

function fadeAudio(audio, targetVolume, duration = 1100, resetWhenSilent = false) {
  if (audioFades.has(audio)) {
    cancelAnimationFrame(audioFades.get(audio));
  }

  const startVolume = audio.volume;
  const startTime = performance.now();
  const clampedTarget = clamp(targetVolume, 0, 1);

  function step(now) {
    const rawProgress = Math.min((now - startTime) / duration, 1);
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    audio.volume = clamp(startVolume + (clampedTarget - startVolume) * progress, 0, 1);

    if (rawProgress < 1) {
      audioFades.set(audio, requestAnimationFrame(step));
      return;
    }

    audioFades.delete(audio);
    audio.volume = clampedTarget;
    if (clampedTarget === 0) {
      audio.pause();
      if (resetWhenSilent) audio.currentTime = 0;
    }
  }

  audioFades.set(audio, requestAnimationFrame(step));
}

function syncMusicToggle() {
  musicToggleButton.setAttribute("aria-pressed", String(musicEnabled));
  musicToggleButton.setAttribute("aria-label", musicEnabled ? "Turn music off" : "Turn music on");
  musicToggleText.textContent = musicEnabled ? "Music on" : "Music off";
}

function playTrack(track) {
  if (!musicEnabled) return;
  const otherTrack = track === safeBgm ? dangerBgm : safeBgm;
  const targetVolume = track === dangerBgm ? 0.34 : 0.42;

  if (!otherTrack.paused || otherTrack.volume > 0) {
    fadeAudio(otherTrack, 0, musicCrossfadeMs, true);
  }

  if (track.paused) {
    track.volume = 0;
  }

  track.play().then(() => {
    fadeAudio(track, targetVolume, musicCrossfadeMs);
  }).catch(() => {
    musicEnabled = false;
    syncMusicToggle();
  });
}

function playSafeBgm() {
  playTrack(safeBgm);
}

function updateMusicForScene(id) {
  const dangerousScene = id === "wolf" || id === "cottage";
  playTrack(dangerousScene ? dangerBgm : safeBgm);
}

function stopAllMusic() {
  fadeAudio(safeBgm, 0, musicStopFadeMs, true);
  fadeAudio(dangerBgm, 0, musicStopFadeMs, true);
}

function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  syncMusicToggle();
  if (!enabled) {
    stopAllMusic();
    return;
  }
  updateMusicForScene(activeNode);
}

function showMap() {
  if (mapActive) return;
  intro.classList.remove("is-active");
  intro.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    mapScreen.classList.add("is-active");
    mapScreen.setAttribute("aria-hidden", "false");
    mapActive = true;
    updateNodeLocks();
    map.focus({ preventScroll: true });
    if (editorMode) return;
    openNode("home");
  }, 520);
}

function nodeIndex(id) {
  return nodeOrder.indexOf(id);
}

function updateNodeLocks() {
  if (editorMode) {
    unlockAllNodesForEditor();
    return;
  }

  document.querySelectorAll(".node").forEach((button) => {
    const index = nodeIndex(button.dataset.node);
    const locked = index > unlockedIndex;
    button.classList.toggle("is-locked", locked);
    button.disabled = locked;
    button.setAttribute("aria-disabled", String(locked));
  });
}

function openNode(id) {
  if (editorMode) return;
  const node = storyNodes[id];
  if (!node) return;
  const index = nodeIndex(id);
  if (index > unlockedIndex) return;
  window.scrollTo(0, 0);
  activeNode = id;
  visited.add(id);
  unlockedIndex = Math.max(unlockedIndex, index + 1);
  updateNodeLocks();
  document.querySelector(`[data-node="${id}"]`)?.classList.add("is-visited");
  updateMusicForScene(id);
  readingPanel.dataset.scene = node.scene;
  nodeLabel.textContent = node.label;
  nodeTitle.textContent = node.title;
  nodeText.innerHTML = node.text.map((paragraph) => `<p>${paragraph}</p>`).join("");
  continueButton.textContent = id === "ending" ? "Return to the map" : "Continue walking";
  overlay.classList.add("is-active");
  overlay.setAttribute("aria-hidden", "false");
  readingPanel.scrollTop = 0;
  readingPanel.focus({ preventScroll: true });
}

function closeOverlay() {
  overlay.classList.remove("is-active");
  overlay.setAttribute("aria-hidden", "true");
  if (activeNode === "cottage" && !visited.has("ending")) {
    setTimeout(() => openNode("ending"), 500);
    return;
  }
  if (activeNode === "ending") {
    storyComplete = true;
    activeNode = "complete";
    completionCard.classList.add("is-active");
    completionCard.setAttribute("aria-hidden", "false");
  }
  continueButton.textContent = activeNode === "ending" ? "Return to the map" : "Continue walking";
  map.focus({ preventScroll: true });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateNodes() {
  if (editorMode) return;
  if (storyComplete) return;
  const nextId = nodeOrder[unlockedIndex];
  const node = storyNodes[nextId];
  if (!node) return;
  const dx = position.x - node.x;
  const dy = position.y - node.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 4.2 && activeNode !== nextId) {
    openNode(nextId);
  }
}

function move(delta) {
  if (!mapActive || overlay.classList.contains("is-active")) return;

  velocity.x = 0;
  velocity.y = 0;

  if (keys.has("arrowleft") || keys.has("a")) velocity.x -= 1;
  if (keys.has("arrowright") || keys.has("d")) velocity.x += 1;
  if (keys.has("arrowup") || keys.has("w")) velocity.y -= 1;
  if (keys.has("arrowdown") || keys.has("s")) velocity.y += 1;

  velocity.x += joystickVector.x;
  velocity.y += joystickVector.y;

  const rect = mapWorld.getBoundingClientRect();
  const visualX = velocity.x * rect.width;
  const visualY = velocity.y * rect.height;
  const visualLength = Math.hypot(visualX, visualY) || 1;
  const speed = 180 * delta;
  position.x = clamp(position.x + (visualX / visualLength) * (speed / rect.width) * 100, 4, 96);
  position.y = clamp(position.y + (visualY / visualLength) * (speed / rect.height) * 100, 9, 91);

  if (velocity.x || velocity.y) {
    riderBody.style.transform = velocity.x < -0.1 ? "scaleX(-1)" : "scaleX(1)";
  }

  setRiderPosition();
  updateNodes();
}

function tick(now) {
  const delta = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  move(delta);
  requestAnimationFrame(tick);
}

function setupJoystick() {
  let dragging = false;

  function updateStick(clientX, clientY) {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const max = rect.width * 0.32;
    const length = Math.min(Math.hypot(dx, dy), max);
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * length;
    const y = Math.sin(angle) * length;
    stick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    joystickVector.x = x / max;
    joystickVector.y = y / max;
  }

  joystick.addEventListener("pointerdown", (event) => {
    dragging = true;
    joystick.setPointerCapture(event.pointerId);
    updateStick(event.clientX, event.clientY);
  });

  joystick.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    updateStick(event.clientX, event.clientY);
  });

  function resetStick() {
    dragging = false;
    joystickVector.x = 0;
    joystickVector.y = 0;
    stick.style.transform = "translate(-50%, -50%)";
  }

  joystick.addEventListener("pointerup", resetStick);
  joystick.addEventListener("pointercancel", resetStick);
}

beginButton.addEventListener("click", showMap);
continueButton.addEventListener("click", closeOverlay);
enableMusicButton.addEventListener("click", () => {
  setMusicEnabled(true);
  dismissMusicPrompt();
});
skipMusicButton.addEventListener("click", () => {
  setMusicEnabled(false);
  dismissMusicPrompt();
});
musicToggleButton.addEventListener("click", () => {
  setMusicEnabled(!musicEnabled);
});

document.querySelectorAll(".node").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (editorMode) {
      event.preventDefault();
      return;
    }
    openNode(button.dataset.node);
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
  if (key === "escape" && overlay.classList.contains("is-active")) {
    closeOverlay();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener("resize", updateCamera);

applySavedNodePositions();
setupNodeEditor();
setupJoystick();
setRiderPosition();
syncMusicToggle();
if (editorMode) {
  dismissMusicPrompt();
  showMap();
}
requestAnimationFrame(tick);

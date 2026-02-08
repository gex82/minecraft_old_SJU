import * as THREE from "three";

import { createDefaultBlockRegistry } from "./engine/BlockRegistry.js";
import { CHUNK_SIZE } from "./engine/constants.js";
import { VoxelEngine } from "./engine/VoxelEngine.js";
import { AudioManager } from "./game/Audio.js";
import { DayNightCycle } from "./game/DayNight.js";
import { Minimap } from "./game/Minimap.js";
import { PlayerController } from "./game/Player.js";
import { settings } from "./game/Settings.js";
import { WorldManager } from "./world/WorldManager.js";

const root = document.getElementById("game-root");
const hudStats = document.getElementById("hud-stats");
const landmarkPanel = document.getElementById("landmark-panel");
const landmarkName = document.getElementById("landmark-name");
const landmarkDescription = document.getElementById("landmark-description");
const landmarkHint = document.getElementById("landmark-hint");
const startOverlay = document.getElementById("start-overlay");
const startButton = document.getElementById("start-button");

// Settings panel elements
const settingsPanel = document.getElementById("settings-panel");
const renderDistanceSlider = document.getElementById("render-distance-slider");
const renderDistanceValue = document.getElementById("render-distance-value");
const masterVolumeSlider = document.getElementById("master-volume-slider");
const masterVolumeValue = document.getElementById("master-volume-value");
const musicVolumeSlider = document.getElementById("music-volume-slider");
const musicVolumeValue = document.getElementById("music-volume-value");
const showFpsCheckbox = document.getElementById("show-fps-checkbox");
const showMinimapCheckbox = document.getElementById("show-minimap-checkbox");
const settingsResetBtn = document.getElementById("settings-reset");
const settingsCloseBtn = document.getElementById("settings-close");
const hud = document.getElementById("hud");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bc6dd);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 350);
camera.position.set(8, 15.6, 8);

const blockRegistry = createDefaultBlockRegistry();
const worldManager = new WorldManager(blockRegistry, { loadRadius: settings.get("renderDistance") });
const voxelEngine = new VoxelEngine(scene, worldManager, blockRegistry);
worldManager.attachEngine(voxelEngine);

const player = new PlayerController(camera, renderer.domElement, new THREE.Vector3(8, 14, 8));
const dayNight = new DayNightCycle(scene);
const audio = new AudioManager();

// Minimap
const minimapCanvas = document.getElementById("minimap");
const minimap = new Minimap(minimapCanvas, worldManager);
minimap.setVisible(settings.get("showMinimap"));

worldManager.update(player.position);

let pinnedLandmarkId = null;
let smoothedFps = 60;
let lastFrame = performance.now();

function chunkCoordinate(value) {
  return Math.floor(Math.floor(value) / CHUNK_SIZE);
}

function renderLandmarkPanel(landmark, isPinned = false) {
  if (!landmark) {
    landmarkPanel.classList.add("hidden");
    return;
  }

  landmarkPanel.classList.remove("hidden");
  landmarkName.textContent = landmark.name;
  landmarkDescription.textContent = `${landmark.description} (${landmark.distance.toFixed(1)}m away)`;
  landmarkHint.textContent = isPinned
    ? "Pinned plaque. Press E again to clear."
    : "Press E to pin or clear this plaque.";
}

function updateHud(deltaSeconds) {
  const instantaneousFps = 1 / Math.max(0.0001, deltaSeconds);
  smoothedFps = smoothedFps * 0.91 + instantaneousFps * 0.09;

  const cx = chunkCoordinate(player.position.x);
  const cz = chunkCoordinate(player.position.z);
  const activeChunks = worldManager.activeChunkKeys.size;
  const generatedChunks = worldManager.chunkMap.size;

  hudStats.textContent =
    `FPS ${smoothedFps.toFixed(0)} | Time ${dayNight.getClockLabel()} | Chunks ${activeChunks}/${generatedChunks}\n` +
    `Pos X ${player.position.x.toFixed(1)} Y ${player.position.y.toFixed(1)} Z ${player.position.z.toFixed(1)}\n` +
    `Chunk ${cx}, ${cz} | Radius ${worldManager.loadRadius}`;
}

function resolveLandmarkDisplay() {
  const nearbyLandmark = worldManager.getNearestLandmark(player.position, 20);
  if (player.consumeInteractRequest()) {
    if (nearbyLandmark && pinnedLandmarkId !== nearbyLandmark.id) {
      pinnedLandmarkId = nearbyLandmark.id;
    } else {
      pinnedLandmarkId = null;
    }
  }

  const pinnedLandmark = pinnedLandmarkId ? worldManager.getLandmarkById(pinnedLandmarkId) : null;
  if (pinnedLandmark) {
    const dx = player.position.x - pinnedLandmark.position.x;
    const dz = player.position.z - pinnedLandmark.position.z;
    renderLandmarkPanel(
      {
        ...pinnedLandmark,
        distance: Math.sqrt(dx * dx + dz * dz),
      },
      true,
    );
  } else {
    renderLandmarkPanel(nearbyLandmark, false);
  }
}

function animate(now) {
  const deltaSeconds = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  player.update(deltaSeconds, worldManager);
  worldManager.update(player.position);
  dayNight.update(deltaSeconds);
  audio.update(deltaSeconds, {
    nightFactor: dayNight.nightFactor,
    stepDistance: player.consumeStepDistance(),
    isGrounded: player.isGrounded,
    speed: player.horizontalSpeed,
  });

  updateHud(deltaSeconds);
  resolveLandmarkDisplay();
  minimap.update(player.position, player.yaw);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function syncOverlay() {
  const active = document.pointerLockElement === renderer.domElement;
  startOverlay.classList.toggle("hidden", active || settingsOpen);
  if (active) {
    audio.unlock();
  }
}

startButton.addEventListener("click", () => {
  player.requestPointerLock();
});

renderer.domElement.addEventListener("click", () => {
  if (document.pointerLockElement !== renderer.domElement) {
    player.requestPointerLock();
  }
});

document.addEventListener("pointerlockchange", syncOverlay);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Settings panel logic
let settingsOpen = false;

function openSettings() {
  if (settingsOpen) {
    return;
  }
  settingsOpen = true;
  settingsPanel.classList.remove("hidden");
  document.exitPointerLock();
  syncOverlay();
}

function closeSettings() {
  if (!settingsOpen) {
    return;
  }
  settingsOpen = false;
  settingsPanel.classList.add("hidden");
  syncOverlay();
}

function syncSettingsUI() {
  renderDistanceSlider.value = settings.get("renderDistance");
  renderDistanceValue.textContent = settings.get("renderDistance");
  masterVolumeSlider.value = settings.get("masterVolume");
  masterVolumeValue.textContent = `${settings.get("masterVolume")}%`;
  musicVolumeSlider.value = settings.get("musicVolume");
  musicVolumeValue.textContent = `${settings.get("musicVolume")}%`;
  showFpsCheckbox.checked = settings.get("showFps");
  showMinimapCheckbox.checked = settings.get("showMinimap");
  hud.style.display = settings.get("showFps") ? "" : "none";
}

renderDistanceSlider.addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  settings.set("renderDistance", val);
  renderDistanceValue.textContent = val;
  worldManager.setLoadRadius(val);
});

masterVolumeSlider.addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  settings.set("masterVolume", val);
  masterVolumeValue.textContent = `${val}%`;
  audio.setMasterVolume(val / 100);
});

musicVolumeSlider.addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  settings.set("musicVolume", val);
  musicVolumeValue.textContent = `${val}%`;
  audio.setMusicVolume(val / 100);
});

showFpsCheckbox.addEventListener("change", (e) => {
  settings.set("showFps", e.target.checked);
  hud.style.display = e.target.checked ? "" : "none";
});

showMinimapCheckbox.addEventListener("change", (e) => {
  settings.set("showMinimap", e.target.checked);
  minimap.setVisible(e.target.checked);
});

settingsResetBtn.addEventListener("click", () => {
  settings.reset();
  syncSettingsUI();
  worldManager.setLoadRadius(settings.get("renderDistance"));
  audio.setMasterVolume(settings.get("masterVolume") / 100);
  audio.setMusicVolume(settings.get("musicVolume") / 100);
});

settingsCloseBtn.addEventListener("click", closeSettings);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (settingsOpen) {
      closeSettings();
    } else if (document.pointerLockElement === renderer.domElement) {
      openSettings();
    }
  }
});

// Initialize settings UI and apply saved values
syncSettingsUI();
audio.setMasterVolume(settings.get("masterVolume") / 100);
audio.setMusicVolume(settings.get("musicVolume") / 100);

syncOverlay();
requestAnimationFrame(animate);

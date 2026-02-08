/**
 * Settings Manager
 * Handles user preferences with localStorage persistence
 */

const STORAGE_KEY = "minecraft_sju_settings";

const DEFAULTS = {
  renderDistance: 4,
  masterVolume: 70,
  musicVolume: 50,
  showFps: true,
  showMinimap: true,
};

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function sanitize(rawValues) {
  return {
    renderDistance: clampInt(rawValues.renderDistance, 2, 8, DEFAULTS.renderDistance),
    masterVolume: clampInt(rawValues.masterVolume, 0, 100, DEFAULTS.masterVolume),
    musicVolume: clampInt(rawValues.musicVolume, 0, 100, DEFAULTS.musicVolume),
    showFps: Boolean(rawValues.showFps),
    showMinimap: Boolean(rawValues.showMinimap),
  };
}

class Settings {
  constructor() {
    this.values = { ...DEFAULTS };
    this.listeners = new Set();
    this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.values = sanitize({ ...DEFAULTS, ...parsed });
      }
    } catch (e) {
      console.warn("Failed to load settings:", e);
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values));
    } catch (e) {
      console.warn("Failed to save settings:", e);
    }
  }

  get(key) {
    return this.values[key];
  }

  set(key, value) {
    const nextValues = sanitize({ ...this.values, [key]: value });
    const nextValue = nextValues[key];
    if (this.values[key] !== nextValue) {
      this.values[key] = nextValue;
      this.save();
      this.notifyListeners(key, nextValue);
    }
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(key, value) {
    for (const listener of this.listeners) {
      listener(key, value);
    }
  }

  reset() {
    this.values = { ...DEFAULTS };
    this.save();
    for (const [key, value] of Object.entries(this.values)) {
      this.notifyListeners(key, value);
    }
  }
}

// Singleton instance
export const settings = new Settings();

// Export defaults for UI
export { DEFAULTS };

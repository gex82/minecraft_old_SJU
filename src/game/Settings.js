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
        this.values = { ...DEFAULTS, ...parsed };
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
    if (this.values[key] !== value) {
      this.values[key] = value;
      this.save();
      this.notifyListeners(key, value);
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

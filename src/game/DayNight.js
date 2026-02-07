import * as THREE from "three";

const SKY_DAY = new THREE.Color(0x8bc6dd);
const SKY_NIGHT = new THREE.Color(0x0b1625);
const SUN_COLOR = 0xfff0c7;

export class DayNightCycle {
  constructor(scene) {
    this.scene = scene;
    this.timeOfDay = 0.31;
    this.cycleDurationSeconds = 240;
    this.nightFactor = 0;
    this.tempColor = new THREE.Color();

    this.hemisphere = new THREE.HemisphereLight(0xcde8ff, 0x23253a, 0.72);
    this.sun = new THREE.DirectionalLight(SUN_COLOR, 1.1);
    this.sun.position.set(45, 72, -28);
    this.sun.castShadow = false;

    this.scene.add(this.hemisphere);
    this.scene.add(this.sun);
    this.scene.fog = new THREE.Fog(0x8bc6dd, 32, 230);

    this.update(0);
  }

  update(deltaSeconds) {
    this.timeOfDay = (this.timeOfDay + deltaSeconds / this.cycleDurationSeconds) % 1;
    const sunAngle = this.timeOfDay * Math.PI * 2;
    const sunHeight = Math.sin(sunAngle);
    const daylight = THREE.MathUtils.clamp(0.09 + (sunHeight + 0.18) * 0.78, 0.06, 1);

    this.nightFactor = 1 - daylight;

    this.sun.position.set(Math.cos(sunAngle) * 86, 22 + sunHeight * 92, Math.sin(sunAngle) * 34);
    this.sun.intensity = Math.max(0, sunHeight) * 1.18 + 0.08;
    this.hemisphere.intensity = 0.18 + daylight * 0.7;

    this.tempColor.copy(SKY_NIGHT).lerp(SKY_DAY, daylight);
    this.scene.background = this.tempColor.clone();
    this.scene.fog.color.copy(this.tempColor);
  }

  getClockLabel() {
    const totalMinutes = Math.floor(this.timeOfDay * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}

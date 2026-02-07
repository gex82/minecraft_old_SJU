import * as THREE from "three";

import { PLAYER_EYE_HEIGHT, PLAYER_HEIGHT, PLAYER_RADIUS } from "../engine/constants.js";

const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight", "Space"]);

export class PlayerController {
  constructor(camera, domElement, startPosition = new THREE.Vector3(8, 16, 8)) {
    this.camera = camera;
    this.domElement = domElement;

    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3();

    this.yaw = Math.PI * 0.25;
    this.pitch = 0;

    this.isPointerLocked = false;
    this.isGrounded = false;

    this.gravity = 24;
    this.walkSpeed = 6.6;
    this.sprintSpeed = 9.4;
    this.jumpSpeed = 9.3;
    this.mouseSensitivity = 0.0022;

    this.keysPressed = new Set();
    this.interactRequested = false;
    this.stepDistance = 0;
    this.horizontalSpeed = 0;

    this.bindEvents();
    this.syncCamera();
  }

  bindEvents() {
    window.addEventListener("keydown", (event) => {
      if (MOVE_KEYS.has(event.code)) {
        event.preventDefault();
      }
      this.keysPressed.add(event.code);
      if (event.code === "KeyE" && !event.repeat) {
        this.interactRequested = true;
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keysPressed.delete(event.code);
    });

    window.addEventListener("blur", () => {
      this.keysPressed.clear();
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.isPointerLocked) {
        return;
      }
      this.yaw -= event.movementX * this.mouseSensitivity;
      this.pitch -= event.movementY * this.mouseSensitivity;
      this.pitch = THREE.MathUtils.clamp(this.pitch, -1.52, 1.52);
    });

    document.addEventListener("pointerlockchange", () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
    });
  }

  requestPointerLock() {
    this.domElement.requestPointerLock();
  }

  consumeInteractRequest() {
    const value = this.interactRequested;
    this.interactRequested = false;
    return value;
  }

  consumeStepDistance() {
    const distance = this.stepDistance;
    this.stepDistance = 0;
    return distance;
  }

  update(deltaSeconds, worldManager) {
    const previousX = this.position.x;
    const previousZ = this.position.z;

    const moveForward = (this.keysPressed.has("KeyW") ? 1 : 0) - (this.keysPressed.has("KeyS") ? 1 : 0);
    const moveRight = (this.keysPressed.has("KeyD") ? 1 : 0) - (this.keysPressed.has("KeyA") ? 1 : 0);
    const isMoving = moveForward !== 0 || moveRight !== 0;
    const isSprinting = this.keysPressed.has("ShiftLeft") || this.keysPressed.has("ShiftRight");

    const targetSpeed = isSprinting ? this.sprintSpeed : this.walkSpeed;
    let wishX = 0;
    let wishZ = 0;

    if (isMoving) {
      const length = Math.hypot(moveForward, moveRight);
      const normalizedForward = moveForward / length;
      const normalizedRight = moveRight / length;
      const sinYaw = Math.sin(this.yaw);
      const cosYaw = Math.cos(this.yaw);

      wishX = (normalizedRight * cosYaw - normalizedForward * sinYaw) * targetSpeed;
      wishZ = (normalizedRight * sinYaw + normalizedForward * cosYaw) * targetSpeed;
    }

    const groundAcceleration = 28;
    const airAcceleration = 11;
    const acceleration = this.isGrounded ? groundAcceleration : airAcceleration;
    const blend = Math.min(1, acceleration * deltaSeconds);

    this.velocity.x += (wishX - this.velocity.x) * blend;
    this.velocity.z += (wishZ - this.velocity.z) * blend;

    if (!isMoving && this.isGrounded) {
      const damping = Math.max(0, 1 - deltaSeconds * 10);
      this.velocity.x *= damping;
      this.velocity.z *= damping;
    }

    if (this.keysPressed.has("Space") && this.isGrounded) {
      this.velocity.y = this.jumpSpeed;
      this.isGrounded = false;
    }

    this.velocity.y -= this.gravity * deltaSeconds;

    const movement = this.velocity.clone().multiplyScalar(deltaSeconds);
    this.isGrounded = false;
    this.moveAxis("x", movement.x, worldManager);
    this.moveAxis("z", movement.z, worldManager);
    this.moveAxis("y", movement.y, worldManager);

    const movedHorizontal = Math.hypot(this.position.x - previousX, this.position.z - previousZ);
    if (this.isGrounded) {
      this.stepDistance += movedHorizontal;
    }

    this.horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    this.syncCamera();
  }

  moveAxis(axis, amount, worldManager) {
    if (amount === 0) {
      return;
    }

    this.position[axis] += amount;

    let collided = false;
    this.forEachCandidateBlock((x, y, z) => {
      if (!worldManager.isSolidAt(x, y, z)) {
        return false;
      }
      if (!this.intersectsBlock(x, y, z)) {
        return false;
      }

      collided = true;
      if (axis === "x") {
        if (amount > 0) {
          this.position.x = x - PLAYER_RADIUS - 0.0001;
        } else {
          this.position.x = x + 1 + PLAYER_RADIUS + 0.0001;
        }
        this.velocity.x = 0;
      } else if (axis === "z") {
        if (amount > 0) {
          this.position.z = z - PLAYER_RADIUS - 0.0001;
        } else {
          this.position.z = z + 1 + PLAYER_RADIUS + 0.0001;
        }
        this.velocity.z = 0;
      } else if (axis === "y") {
        if (amount > 0) {
          this.position.y = y - PLAYER_HEIGHT - 0.0001;
        } else {
          this.position.y = y + 1 + 0.0001;
          this.isGrounded = true;
        }
        this.velocity.y = 0;
      }

      return true;
    });

    if (!collided && axis === "y" && amount < 0) {
      this.isGrounded = false;
    }
  }

  forEachCandidateBlock(callback) {
    const minX = Math.floor(this.position.x - PLAYER_RADIUS);
    const maxX = Math.floor(this.position.x + PLAYER_RADIUS);
    const minY = Math.floor(this.position.y);
    const maxY = Math.floor(this.position.y + PLAYER_HEIGHT);
    const minZ = Math.floor(this.position.z - PLAYER_RADIUS);
    const maxZ = Math.floor(this.position.z + PLAYER_RADIUS);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let z = minZ; z <= maxZ; z += 1) {
          if (callback(x, y, z)) {
            return;
          }
        }
      }
    }
  }

  intersectsBlock(blockX, blockY, blockZ) {
    const minX = this.position.x - PLAYER_RADIUS;
    const maxX = this.position.x + PLAYER_RADIUS;
    const minY = this.position.y;
    const maxY = this.position.y + PLAYER_HEIGHT;
    const minZ = this.position.z - PLAYER_RADIUS;
    const maxZ = this.position.z + PLAYER_RADIUS;

    return (
      maxX > blockX &&
      minX < blockX + 1 &&
      maxY > blockY &&
      minY < blockY + 1 &&
      maxZ > blockZ &&
      minZ < blockZ + 1
    );
  }

  syncCamera() {
    this.camera.position.set(this.position.x, this.position.y + PLAYER_EYE_HEIGHT, this.position.z);
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}

import * as THREE from 'three';
import gsap from 'gsap';

export class CameraManager {
  constructor(container, controls) {
    this.container = container;
    this.controls = controls;

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);

    // Initial default cinematic hero view
    this.defaultPos = new THREE.Vector3(1.6, 1.4, 3.2);
    this.defaultTarget = new THREE.Vector3(0.45, 0.75, 0.1);

    this.camera.position.copy(this.defaultPos);

    this.presets = {
      default: { pos: this.defaultPos.clone(), target: this.defaultTarget.clone() },
      front: { pos: new THREE.Vector3(0.5, 1.0, 3.2), target: new THREE.Vector3(0.45, 0.75, 0.1) },
      rear: { pos: new THREE.Vector3(0.45, 1.1, -3.2), target: new THREE.Vector3(0.45, 0.75, 0.1) },
      left: { pos: new THREE.Vector3(-3.0, 1.0, 0.2), target: new THREE.Vector3(0.0, 0.75, 0.1) },
      right: { pos: new THREE.Vector3(3.4, 1.0, 0.2), target: new THREE.Vector3(0.9, 0.75, 0.1) },
      top: { pos: new THREE.Vector3(0.5, 4.2, 0.2), target: new THREE.Vector3(0.5, 0.6, 0.1) },
      screen: { pos: new THREE.Vector3(0, 0.98, 0.85), target: new THREE.Vector3(0, 0.98, 0.19) },
      scooter: { pos: new THREE.Vector3(1.1, 0.75, 1.6), target: new THREE.Vector3(1.05, 0.5, 0.15) },
      reel: { pos: new THREE.Vector3(0.35, 0.45, 0.85), target: new THREE.Vector3(0.0, 0.42, 0.2) }
    };
  }

  setControls(controls) {
    this.controls = controls;
    if (this.controls) {
      this.controls.target.copy(this.defaultTarget);
      this.controls.update();
    }
  }

  transitionTo({ position, target, duration = 1.2, onComplete = null }) {
    if (!this.camera || !this.controls) return;

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    gsap.to(this.camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration,
      ease: 'power2.inOut'
    });

    gsap.to(this.controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => this.controls.update(),
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
  }

  setPreset(name, duration = 1.2) {
    const p = this.presets[name];
    if (!p) return;
    this.transitionTo({
      position: p.pos,
      target: p.target,
      duration
    });
  }

  reset(duration = 1.2) {
    this.setPreset('default', duration);
  }

  onResize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}

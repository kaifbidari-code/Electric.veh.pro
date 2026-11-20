import * as THREE from 'three';
import { systemState } from '../simulation/systemState.js';

export class WeatherSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Weather_Particles';
    this.scene.add(this.group);

    this.rainCount = 2000;
    this.dustCount = 1000;

    this.buildRainSystem();
    this.buildDustSystem();

    this.currentWeather = 'CLEAR';
    this.applyWeather(systemState.weather);
  }

  buildRainSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;     // x
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;   // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14; // z
      velocities[i] = 7.0 + Math.random() * 5.0;        // fall speed
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainVelocities = velocities;

    const mat = new THREE.PointsMaterial({
      color: 0x99ccff,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.rainPoints = new THREE.Points(geo, mat);
    this.group.add(this.rainPoints);
  }

  buildDustSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.dustCount * 3);
    const speeds = new Float32Array(this.dustCount * 3);

    for (let i = 0; i < this.dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 4.5 + 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      speeds[i * 3] = (Math.random() - 0.5) * 1.5;     // vx
      speeds[i * 3 + 1] = (Math.random() - 0.5) * 0.4; // vy
      speeds[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // vz
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dustSpeeds = speeds;

    const mat = new THREE.PointsMaterial({
      color: 0xd4a373,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending
    });

    this.dustPoints = new THREE.Points(geo, mat);
    this.group.add(this.dustPoints);
  }

  applyWeather(w) {
    this.currentWeather = w;
    if (w === 'RAIN') {
      this.rainPoints.visible = true;
      this.dustPoints.visible = false;
    } else if (w === 'DUST') {
      this.rainPoints.visible = false;
      this.dustPoints.visible = true;
    } else {
      // CLEAR
      this.rainPoints.visible = false;
      this.dustPoints.visible = false;
    }
  }

  update(dt = 0.016) {
    if (this.currentWeather === 'RAIN' && this.rainPoints.visible) {
      const posAttr = this.rainPoints.geometry.attributes.position;
      const pos = posAttr.array;
      const count = this.rainCount;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= this.rainVelocities[i] * dt;
        pos[i * 3] += 0.4 * dt; // slight wind slant

        // If hits floor, reset to top
        if (pos[i * 3 + 1] < 0.02) {
          pos[i * 3 + 1] = 7.5 + Math.random() * 2.0;
          pos[i * 3] = (Math.random() - 0.5) * 14;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
        }
      }
      posAttr.needsUpdate = true;
    }

    if (this.currentWeather === 'DUST' && this.dustPoints.visible) {
      const posAttr = this.dustPoints.geometry.attributes.position;
      const pos = posAttr.array;
      const count = this.dustCount;

      for (let i = 0; i < count; i++) {
        pos[i * 3] += this.dustSpeeds[i * 3] * dt;
        pos[i * 3 + 1] += Math.sin(Date.now() * 0.002 + i) * 0.15 * dt;
        pos[i * 3 + 2] += this.dustSpeeds[i * 3 + 2] * dt;

        // Wrap around bounds
        if (pos[i * 3] > 6) pos[i * 3] = -6;
        if (pos[i * 3] < -6) pos[i * 3] = 6;
        if (pos[i * 3 + 2] > 6) pos[i * 3 + 2] = -6;
        if (pos[i * 3 + 2] < -6) pos[i * 3 + 2] = 6;
      }
      posAttr.needsUpdate = true;
    }
  }
}

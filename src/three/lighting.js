import * as THREE from 'three';
import gsap from 'gsap';
import { systemState } from '../simulation/systemState.js';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'Lighting_Group';
    this.scene.add(this.group);

    this.initLights();
    this.applyMode(systemState.mode, false);
  }

  initLights() {
    // 1. Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x0a1424, 0.4);
    this.group.add(this.ambientLight);

    // 2. Hemisphere Light (Sky vs Ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0x1a2e4c, 0x07111e, 0.5);
    this.hemiLight.position.set(0, 20, 0);
    this.group.add(this.hemiLight);

    // 3. Directional Key Light (Moonlight at night / Sunlight in day)
    this.dirLight = new THREE.DirectionalLight(0x90c0ff, 0.6);
    this.dirLight.position.set(4, 8, 5);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 25;
    this.dirLight.shadow.camera.left = -4;
    this.dirLight.shadow.camera.right = 4;
    this.dirLight.shadow.camera.top = 4;
    this.dirLight.shadow.camera.bottom = -2;
    this.dirLight.shadow.bias = -0.0005;
    this.group.add(this.dirLight);

    // 4. Canopy Overhead Spotlight (Casts focused dramatic cone downward on station & scooter)
    this.canopySpot = new THREE.SpotLight(0x39ff63, 2.5);
    this.canopySpot.position.set(0, 3.2, 0.6);
    this.canopySpot.target.position.set(0.4, 0.4, 0.2);
    this.canopySpot.angle = Math.PI / 4;
    this.canopySpot.penumbra = 0.6;
    this.canopySpot.decay = 1.8;
    this.canopySpot.distance = 6;
    this.canopySpot.castShadow = true;
    this.canopySpot.shadow.mapSize.width = 1024;
    this.canopySpot.shadow.mapSize.height = 1024;
    this.group.add(this.canopySpot);
    this.group.add(this.canopySpot.target);

    // 5. Cyan Accent Point Light near the scooter
    this.cyanPoint = new THREE.PointLight(0x00d9ff, 1.8, 4.0, 1.6);
    this.cyanPoint.position.set(1.1, 0.8, 0.5);
    this.group.add(this.cyanPoint);

    // 6. Neon Green Accent Point Light near the station screen
    this.greenPoint = new THREE.PointLight(0x39ff63, 1.5, 3.5, 1.8);
    this.greenPoint.position.set(0, 1.1, 0.45);
    this.group.add(this.greenPoint);
  }

  applyMode(mode, animate = true) {
    const isNight = mode === 'NIGHT';
    const dur = animate ? 1.2 : 0;

    if (isNight) {
      // Cinematic Night Settings
      gsap.to(this.ambientLight, { intensity: 0.35, duration: dur });
      this.ambientLight.color.setHex(0x061120);

      gsap.to(this.hemiLight, { intensity: 0.4, duration: dur });
      this.hemiLight.color.setHex(0x0e223d);
      this.hemiLight.groundColor.setHex(0x030810);

      gsap.to(this.dirLight, { intensity: 0.7, duration: dur });
      this.dirLight.color.setHex(0x82b4ff);
      this.dirLight.position.set(4, 7, 4);

      gsap.to(this.canopySpot, { intensity: 2.8, duration: dur });
      this.canopySpot.color.setHex(0x39ff63);

      gsap.to(this.cyanPoint, { intensity: 2.0, duration: dur });
      gsap.to(this.greenPoint, { intensity: 1.6, duration: dur });
    } else {
      // Daylight Settings
      gsap.to(this.ambientLight, { intensity: 0.85, duration: dur });
      this.ambientLight.color.setHex(0x94a3b8);

      gsap.to(this.hemiLight, { intensity: 0.9, duration: dur });
      this.hemiLight.color.setHex(0xe2e8f0);
      this.hemiLight.groundColor.setHex(0x64748b);

      gsap.to(this.dirLight, { intensity: 2.2, duration: dur });
      this.dirLight.color.setHex(0xfff8ee);
      this.dirLight.position.set(6, 12, 6);

      gsap.to(this.canopySpot, { intensity: 0.8, duration: dur });
      this.canopySpot.color.setHex(0xffffff);

      gsap.to(this.cyanPoint, { intensity: 0.6, duration: dur });
      gsap.to(this.greenPoint, { intensity: 0.5, duration: dur });
    }
  }

  update(dt = 0.016) {
    const s = systemState;
    if (s.theftAlarm) {
      // Flashing red warning light effect
      const flash = Math.sin(Date.now() * 0.015) > 0 ? 3.5 : 0.2;
      this.canopySpot.color.setHex(0xff3030);
      this.canopySpot.intensity = flash;
    } else if (s.activeFault || s.tempState === 'CRITICAL') {
      this.canopySpot.color.setHex(0xff3030);
      this.canopySpot.intensity = 2.0;
    } else if (s.status === 'CHARGING') {
      this.canopySpot.color.setHex(0x39ff63);
      if (s.mode === 'NIGHT') {
        this.canopySpot.intensity = 2.8 + Math.sin(Date.now() * 0.005) * 0.5;
      }
    }
  }
}

import * as THREE from 'three';
import { CameraManager } from './camera.js';
import { ControlsManager } from './controls.js';
import { LightingManager } from './lighting.js';
import { Environment } from './environment.js';
import { ChargingStation } from './chargingStation.js';
import { ElectricScooter } from './scooter.js';
import { CableSystem } from './cableReel.js';
import { WeatherSystem } from './weather.js';
import { ExplodedViewManager } from './explodedView.js';
import { systemState } from '../simulation/systemState.js';
import { eventBus } from '../simulation/eventBus.js';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;

    // WebGL support check
    if (!this.checkWebGL()) {
      this.showFallbackMessage();
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030b14);
    this.scene.fog = new THREE.FogExp2(0x030b14, 0.04);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    // Camera & Controls
    this.cameraManager = new CameraManager(this.container);
    this.controlsManager = new ControlsManager(this.cameraManager.camera, this.renderer.domElement);
    this.cameraManager.setControls(this.controlsManager.controls);

    // Environment & Lighting
    this.environment = new Environment();
    this.scene.add(this.environment.group);

    this.lighting = new LightingManager(this.scene);

    // Charging Station & Electric Scooter
    this.station = new ChargingStation();
    this.scene.add(this.station.group);

    this.scooter = new ElectricScooter();
    this.scene.add(this.scooter.group);

    // Dynamic Cable System connecting station and scooter
    this.cableSystem = new CableSystem(this.station, this.scooter);
    this.scene.add(this.cableSystem.group);

    // Weather Particles System
    this.weather = new WeatherSystem(this.scene);

    // Exploded View Manager
    this.explodedManager = new ExplodedViewManager(this.station, this.cameraManager);

    // Setup raycaster targets
    const selectables = [
      ...this.station.selectableMeshes,
      ...this.scooter.selectableMeshes
    ];
    this.controlsManager.setSelectables(selectables);

    // Clock
    this.clock = new THREE.Clock();
    this.isRunning = true;

    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    // Listen for state changes
    this.bindEvents();

    // Start loop
    this.animate();
  }

  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  showFallbackMessage() {
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;background:#030b14;padding:2rem;text-align:center;">
        <h2 style="color:#39ff63;margin-bottom:1rem;font-family:sans-serif;">Hardware WebGL Acceleration Required</h2>
        <p style="color:#bfc8d2;max-width:500px;line-height:1.6;">Your browser does not currently support WebGL 3D rendering. Please enable hardware acceleration in your browser settings to experience the interactive SmartGuard EV 3D model.</p>
      </div>
    `;
  }

  bindEvents() {
    eventBus.on('cable:extended', () => {
      this.cableSystem.setConnectorExtended(true);
    });

    eventBus.on('cable:retracted', () => {
      this.cableSystem.setConnectorToHolster(true);
    });

    eventBus.on('scooter:connected', () => {
      this.cableSystem.setConnectorToScooter(true);
    });

    eventBus.on('scooter:disconnected', () => {
      this.cableSystem.setConnectorExtended(true);
    });

    eventBus.on('mode:changed', (mode) => {
      this.lighting.applyMode(mode, true);
      this.environment.setMode(mode);
      if (mode === 'DAY') {
        this.scene.background.setHex(0x132135);
        this.scene.fog.color.setHex(0x132135);
      } else {
        this.scene.background.setHex(0x030b14);
        this.scene.fog.color.setHex(0x030b14);
      }
    });

    eventBus.on('weather:changed', (w) => {
      this.weather.applyWeather(w);
    });

    eventBus.on('exploded:changed', (isExp) => {
      if (isExp) {
        this.explodedManager.explode();
      } else {
        this.explodedManager.assemble();
      }
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.cameraManager) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    this.cameraManager.onResize(w, h);
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const dt = this.clock.getDelta();

    // 1. Update State tick for charging simulation
    systemState.tick(dt);

    // 2. Update Three.js entities
    this.controlsManager.update();
    this.station.update(dt);
    this.scooter.update(dt);
    this.cableSystem.update(dt);
    this.lighting.update(dt);
    this.weather.update(dt);

    // 3. Render
    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  dispose() {
    this.isRunning = false;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

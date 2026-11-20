import * as THREE from 'three';
import gsap from 'gsap';
import { systemState } from '../simulation/systemState.js';

export class ExplodedViewManager {
  constructor(station, cameraManager) {
    this.station = station;
    this.cameraManager = cameraManager;
    this.isExploded = false;

    // Define exploded 3D offsets for each of the 8 modules
    this.offsets = {
      canopy: { x: 0, y: 0.65, z: 0.20 },
      ledModule: { x: 0, y: 0.35, z: 0.10 },
      displayModule: { x: 0, y: 0.08, z: 0.48 },
      cableReel: { x: 0.45, y: -0.05, z: 0.32 },
      sensors: { x: -0.46, y: 0.12, z: 0.18 },
      protection: { x: 0, y: -0.05, z: -0.48 },
      mainEnclosure: { x: 0, y: 0, z: 0 },
      baseUnit: { x: 0, y: -0.35, z: 0 }
    };

    // Connecting lines group
    this.linesGroup = new THREE.Group();
    this.linesGroup.name = 'Exploded_Guide_Lines';
    this.station.group.add(this.linesGroup);
    this.linesGroup.visible = false;

    this.lineMaterial = new THREE.LineDashedMaterial({
      color: 0x00d9ff,
      dashSize: 0.04,
      gapSize: 0.02,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.6
    });

    this.createGuideLines();
  }

  createGuideLines() {
    // Clear any existing lines
    while (this.linesGroup.children.length > 0) {
      this.linesGroup.remove(this.linesGroup.children[0]);
    }

    Object.entries(this.offsets).forEach(([key, offset]) => {
      if (offset.x === 0 && offset.y === 0 && offset.z === 0) return;

      const points = [
        new THREE.Vector3(0, offset.y > 0 ? 0.7 : 0.4, 0),
        new THREE.Vector3(offset.x, offset.y + 0.7, offset.z)
      ];

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, this.lineMaterial);
      line.computeLineDistances();
      this.linesGroup.add(line);
    });
  }

  explode() {
    if (this.isExploded) return;
    this.isExploded = true;
    systemState.setExploded(true);

    const tl = gsap.timeline();

    Object.entries(this.offsets).forEach(([key, offset]) => {
      const mod = this.station.modules[key];
      if (mod) {
        tl.to(mod.position, {
          x: offset.x,
          y: offset.y,
          z: offset.z,
          duration: 1.2,
          ease: 'power3.out'
        }, 0);
      }
    });

    // Fade in guide lines
    this.linesGroup.visible = true;
    gsap.fromTo(this.lineMaterial, { opacity: 0 }, { opacity: 0.6, duration: 1.0, delay: 0.2 });

    // Move camera to optimal exploded inspection view
    if (this.cameraManager) {
      this.cameraManager.transitionTo({
        position: new THREE.Vector3(2.2, 1.6, 2.4),
        target: new THREE.Vector3(0, 0.8, 0),
        duration: 1.4
      });
    }
  }

  assemble() {
    if (!this.isExploded) return;
    this.isExploded = false;
    systemState.setExploded(false);

    const tl = gsap.timeline();

    Object.keys(this.offsets).forEach(key => {
      const mod = this.station.modules[key];
      if (mod) {
        tl.to(mod.position, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.1,
          ease: 'power3.inOut'
        }, 0);
      }
    });

    // Hide guide lines
    gsap.to(this.lineMaterial, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        this.linesGroup.visible = false;
      }
    });

    // Camera returns to primary hero perspective
    if (this.cameraManager) {
      this.cameraManager.reset();
    }
  }

  toggle() {
    if (this.isExploded) {
      this.assemble();
    } else {
      this.explode();
    }
    return this.isExploded;
  }
}

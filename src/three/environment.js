import * as THREE from 'three';
import { systemState } from '../simulation/systemState.js';

export class Environment {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Urban_Environment';

    this.materials = this.initMaterials();
    this.buildGround();
    this.buildParkingMarkings();
    this.buildArchitecturalBackdrop();
    this.buildUrbanElements();
  }

  initMaterials() {
    return {
      asphalt: new THREE.MeshStandardMaterial({
        color: 0x0c1119,
        roughness: 0.55,
        metalness: 0.25,
        envMapIntensity: 0.8
      }),
      concretePlinth: new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.7,
        metalness: 0.1
      }),
      evGreenPaint: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.4,
        metalness: 0.1
      }),
      whiteLinePaint: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.35,
        metalness: 0.1
      }),
      curbstone: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.8
      }),
      buildingWall: new THREE.MeshStandardMaterial({
        color: 0x07111e,
        roughness: 0.9,
        metalness: 0.2
      }),
      buildingWindows: new THREE.MeshBasicMaterial({
        color: 0x00d9ff,
        transparent: true,
        opacity: 0.35
      }),
      bollardMetal: new THREE.MeshStandardMaterial({
        color: 0x222a36,
        metalness: 0.8,
        roughness: 0.3
      }),
      neonBollardLight: new THREE.MeshStandardMaterial({
        color: 0x00d9ff,
        emissive: 0x00d9ff,
        emissiveIntensity: 1.5
      }),
      foliageMat: new THREE.MeshStandardMaterial({
        color: 0x154734,
        roughness: 0.9
      }),
      planterWood: new THREE.MeshStandardMaterial({
        color: 0x2e1e18,
        roughness: 0.8
      })
    };
  }

  // 1. ASPHALT GROUND & CONCRETE STATION PLINTH
  buildGround() {
    // Large ground plane (30m x 30m)
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const ground = new THREE.Mesh(groundGeo, this.materials.asphalt);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Raised architectural charging plinth under station (0.9m x 0.8m x 0.04m)
    const plinthGeo = new THREE.BoxGeometry(0.9, 0.04, 0.8);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.concretePlinth);
    plinth.position.set(0, 0.02, 0);
    plinth.receiveShadow = true;
    this.group.add(plinth);

    // Curbstone divider behind the station
    const curbGeo = new THREE.BoxGeometry(5.0, 0.12, 0.25);
    const curb = new THREE.Mesh(curbGeo, this.materials.curbstone);
    curb.position.set(0.6, 0.06, -0.9);
    curb.receiveShadow = true;
    this.group.add(curb);
  }

  // 2. EV PARKING BAY LINES & ROAD STENCILS
  buildParkingMarkings() {
    // Scooter Parking Stall (1.2m W x 2.0m L) placed beside station
    const stallGroup = new THREE.Group();
    stallGroup.position.set(1.1, 0.002, 0.15);

    // Green tinted parking zone surface
    const stallSurfaceGeo = new THREE.PlaneGeometry(1.1, 1.9);
    const stallSurface = new THREE.Mesh(stallSurfaceGeo, this.materials.evGreenPaint);
    stallSurface.rotation.x = -Math.PI / 2;
    stallSurface.receiveShadow = true;
    stallGroup.add(stallSurface);

    // White perimeter border lines (0.05m wide)
    const lineThickness = 0.05;
    // Left & Right lines
    [-0.55, 0.55].forEach(x => {
      const lineGeo = new THREE.PlaneGeometry(lineThickness, 1.9);
      const line = new THREE.Mesh(lineGeo, this.materials.whiteLinePaint);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.003, 0);
      stallGroup.add(line);
    });

    // Top & Bottom lines
    [-0.95, 0.95].forEach(z => {
      const lineGeo = new THREE.PlaneGeometry(1.15, lineThickness);
      const line = new THREE.Mesh(lineGeo, this.materials.whiteLinePaint);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.003, z);
      stallGroup.add(line);
    });

    // Painted "EV TWO-WHEELER" text / stencil block
    const stencilGeo = new THREE.PlaneGeometry(0.65, 0.25);
    const stencilMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const stencil = new THREE.Mesh(stencilGeo, stencilMat);
    stencil.rotation.x = -Math.PI / 2;
    stencil.position.set(0, 0.004, -0.6);
    stallGroup.add(stencil);

    this.group.add(stallGroup);
  }

  // 3. ARCHITECTURAL MODERN BACKDROP & APARTMENT SILHOUETTES
  buildArchitecturalBackdrop() {
    const bgGroup = new THREE.Group();

    // Feature architectural perimeter wall (textured panels behind station)
    const wallGeo = new THREE.BoxGeometry(7.0, 3.2, 0.25);
    const wall = new THREE.Mesh(wallGeo, this.materials.buildingWall);
    wall.position.set(0.6, 1.6, -1.8);
    wall.receiveShadow = true;
    bgGroup.add(wall);

    // Modern vertical architectural accent battens
    for (let x = -2.6; x <= 3.8; x += 0.5) {
      const battenGeo = new THREE.BoxGeometry(0.06, 3.2, 0.08);
      const batten = new THREE.Mesh(battenGeo, this.materials.bollardMetal);
      batten.position.set(x, 1.6, -1.65);
      bgGroup.add(batten);
    }

    // Overhead cantilever pergola roof structure (modern EV charging canopy style)
    const beamGeo = new THREE.BoxGeometry(5.5, 0.15, 2.8);
    const beam = new THREE.Mesh(beamGeo, this.materials.bollardMetal);
    beam.position.set(0.6, 3.3, -0.3);
    bgGroup.add(beam);

    // Support pillars
    [-1.8, 3.0].forEach(x => {
      const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.3, 16);
      const pillar = new THREE.Mesh(pillarGeo, this.materials.bollardMetal);
      pillar.position.set(x, 1.65, -1.5);
      pillar.castShadow = true;
      bgGroup.add(pillar);
    });

    // Distant apartment buildings with illuminated window matrices
    const bldg1Geo = new THREE.BoxGeometry(6.0, 10.0, 4.0);
    const bldg1 = new THREE.Mesh(bldg1Geo, this.materials.buildingWall);
    bldg1.position.set(-6.5, 5.0, -7.0);
    bgGroup.add(bldg1);

    // Window grid
    for (let floor = 1; floor <= 7; floor++) {
      for (let col = -2; col <= 2; col++) {
        if (Math.sin(floor * 3 + col * 5) > -0.2) { // Varied lit windows
          const winGeo = new THREE.PlaneGeometry(0.5, 0.6);
          const win = new THREE.Mesh(winGeo, this.materials.buildingWindows);
          win.position.set(-6.5 + col * 0.9, floor * 1.2, -4.95);
          bgGroup.add(win);
        }
      }
    }

    // Second apartment tower on the right
    const bldg2Geo = new THREE.BoxGeometry(7.0, 12.0, 4.5);
    const bldg2 = new THREE.Mesh(bldg2Geo, this.materials.buildingWall);
    bldg2.position.set(7.5, 6.0, -8.0);
    bgGroup.add(bldg2);

    for (let floor = 1; floor <= 9; floor++) {
      for (let col = -2.5; col <= 2.5; col += 1.0) {
        if (Math.cos(floor * 4 + col * 2) > -0.3) {
          const winGeo = new THREE.PlaneGeometry(0.55, 0.65);
          const win = new THREE.Mesh(winGeo, this.materials.buildingWindows);
          win.position.set(7.5 + col * 0.9, floor * 1.15, -5.7);
          bgGroup.add(win);
        }
      }
    }

    this.group.add(bgGroup);
  }

  // 4. URBAN ELEMENTS: BOLLARDS, PLANTERS & TREES
  buildUrbanElements() {
    // Modern ambient LED lighting bollards along parking edge
    [-1.4, 2.5].forEach(x => {
      const bollardGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 16);
      const bollard = new THREE.Mesh(bollardGeo, this.materials.bollardMetal);
      bollard.position.set(x, 0.425, 1.4);
      bollard.castShadow = true;
      this.group.add(bollard);

      // Glowing cyan top cap
      const capGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.06, 16);
      const cap = new THREE.Mesh(capGeo, this.materials.neonBollardLight);
      cap.position.set(x, 0.88, 1.4);
      this.group.add(cap);
    });

    // Planter box with modern manicured shrub / foliage
    const planterGeo = new THREE.BoxGeometry(1.6, 0.45, 0.7);
    const planter = new THREE.Mesh(planterGeo, this.materials.planterWood);
    planter.position.set(-2.2, 0.225, -0.9);
    planter.castShadow = true;
    this.group.add(planter);

    // Decorative greenery
    for (let i = 0; i < 3; i++) {
      const foliageGeo = new THREE.DodecahedronGeometry(0.28, 1);
      const foliage = new THREE.Mesh(foliageGeo, this.materials.foliageMat);
      foliage.position.set(-2.6 + i * 0.4, 0.58, -0.9);
      foliage.castShadow = true;
      this.group.add(foliage);
    }
  }

  setMode(mode) {
    if (mode === 'DAY') {
      this.materials.asphalt.color.setHex(0x2a3342);
      this.materials.buildingWall.color.setHex(0x475569);
      this.materials.buildingWindows.opacity = 0.15;
    } else {
      this.materials.asphalt.color.setHex(0x0c1119);
      this.materials.buildingWall.color.setHex(0x07111e);
      this.materials.buildingWindows.opacity = 0.4;
    }
  }
}

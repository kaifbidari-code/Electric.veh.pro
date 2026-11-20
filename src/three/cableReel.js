import * as THREE from 'three';
import gsap from 'gsap';
import { systemState } from '../simulation/systemState.js';
import { audioService } from '../simulation/audioService.js';

export class CableSystem {
  constructor(station, scooter) {
    this.station = station;
    this.scooter = scooter;
    this.group = new THREE.Group();
    this.group.name = 'Charging_Cable_System';

    this.materials = {
      cableRubber: new THREE.MeshStandardMaterial({
        color: 0x1a212d,
        roughness: 0.85,
        metalness: 0.15
      }),
      connectorBody: new THREE.MeshStandardMaterial({
        color: 0x0a1017,
        metalness: 0.5,
        roughness: 0.2
      }),
      connectorSilver: new THREE.MeshStandardMaterial({
        color: 0xc8d1dc,
        metalness: 0.85,
        roughness: 0.2
      }),
      ledRingGreen: new THREE.MeshStandardMaterial({
        color: 0x39ff63,
        emissive: 0x39ff63,
        emissiveIntensity: 1.8
      }),
      ledRingCyan: new THREE.MeshStandardMaterial({
        color: 0x00d9ff,
        emissive: 0x00d9ff,
        emissiveIntensity: 1.5
      }),
      ledRingRed: new THREE.MeshStandardMaterial({
        color: 0xff3030,
        emissive: 0xff3030,
        emissiveIntensity: 2.0
      }),
      pinsCopper: new THREE.MeshStandardMaterial({
        color: 0xb87333,
        metalness: 0.9,
        roughness: 0.2
      })
    };

    // 1. Build charging plug connector gun
    this.buildConnector();
    this.group.add(this.connectorGroup);

    // 2. Cable tube mesh
    this.cableMesh = null;

    // Anchor coordinates
    // Station nozzle outlet world position
    this.outletPos = new THREE.Vector3(0.12, 0.32, 0.19);
    // Holster world position on station
    this.holsterPos = new THREE.Vector3(0.24, 0.42, 0.05);

    // Initial state matching systemState
    if (systemState.cableState === 'CONNECTED') {
      this.setConnectorToScooter(false);
    } else if (systemState.cableState === 'EXTENDED') {
      this.setConnectorExtended(false);
    } else {
      this.setConnectorToHolster(false);
    }

    this.updateCableMesh();
  }

  buildConnector() {
    this.connectorGroup = new THREE.Group();
    this.connectorGroup.name = 'Charging_Plug_Gun';

    // Barrel / head body (Cylinder)
    const barrelGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.09, 16);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, this.materials.connectorBody);
    barrel.castShadow = true;
    this.connectorGroup.add(barrel);

    // Ergonomic handle grip (angled cylinder)
    const handleGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.11, 16);
    const handle = new THREE.Mesh(handleGeo, this.materials.connectorSilver);
    handle.position.set(-0.02, -0.06, 0);
    handle.rotation.z = 0.35;
    handle.castShadow = true;
    this.connectorGroup.add(handle);

    // Thumb latch / trigger button
    const triggerGeo = new THREE.BoxGeometry(0.03, 0.012, 0.015);
    const trigger = new THREE.Mesh(triggerGeo, this.materials.ledRingCyan);
    trigger.position.set(0.01, 0.03, 0);
    this.connectorGroup.add(trigger);

    // Glowing LED status collar ring
    const ringGeo = new THREE.TorusGeometry(0.026, 0.005, 12, 24);
    ringGeo.rotateY(Math.PI / 2);
    this.connectorLedRing = new THREE.Mesh(ringGeo, this.materials.ledRingCyan);
    this.connectorLedRing.position.set(0.02, 0, 0);
    this.connectorGroup.add(this.connectorLedRing);

    // Plug insertion collar tip
    const tipGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.025, 16);
    tipGeo.rotateZ(Math.PI / 2);
    const tip = new THREE.Mesh(tipGeo, this.materials.connectorSilver);
    tip.position.set(0.055, 0, 0);
    this.connectorGroup.add(tip);

    // Conductive pins
    const pinGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.015, 8);
    pinGeo.rotateZ(Math.PI / 2);
    [[-0.006, 0.006], [0.006, 0.006], [0, -0.007]].forEach(([y, z]) => {
      const pin = new THREE.Mesh(pinGeo, this.materials.pinsCopper);
      pin.position.set(0.065, y, z);
      this.connectorGroup.add(pin);
    });

    // Flexible rubber strain-relief tail where cable enters
    const tailGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.04, 12);
    tailGeo.rotateZ(Math.PI / 2);
    const tail = new THREE.Mesh(tailGeo, this.materials.cableRubber);
    tail.position.set(-0.06, 0, 0);
    this.connectorGroup.add(tail);
  }

  // Get current cable inlet point on the connector
  getConnectorTailPos() {
    const v = new THREE.Vector3(-0.07, 0, 0);
    return this.connectorGroup.localToWorld(v);
  }

  setConnectorToHolster(animate = true) {
    const targetPos = this.holsterPos.clone();
    const targetRot = new THREE.Euler(0, 0, -Math.PI / 2);

    if (!animate) {
      this.connectorGroup.position.copy(targetPos);
      this.connectorGroup.rotation.copy(targetRot);
      this.updateCableMesh();
      return;
    }

    gsap.to(this.connectorGroup.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.updateCableMesh();
        if (this.station.reelSpool) {
          this.station.reelSpool.rotation.z -= 0.3; // Spin reel on retract
        }
      },
      onComplete: () => {
        audioService.playPlugIn();
      }
    });

    gsap.to(this.connectorGroup.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.2,
      ease: 'power2.inOut'
    });
  }

  setConnectorExtended(animate = true) {
    const targetPos = new THREE.Vector3(0.55, 0.45, 0.18);
    const targetRot = new THREE.Euler(0, 0.2, 0);

    if (!animate) {
      this.connectorGroup.position.copy(targetPos);
      this.connectorGroup.rotation.copy(targetRot);
      this.updateCableMesh();
      return;
    }

    gsap.to(this.connectorGroup.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => {
        this.updateCableMesh();
        if (this.station.reelSpool) {
          this.station.reelSpool.rotation.z += 0.35; // Spin reel on extend
        }
      }
    });

    gsap.to(this.connectorGroup.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.0,
      ease: 'power2.out'
    });
  }

  setConnectorToScooter(animate = true) {
    const scooterPortWorld = this.scooter.getPortWorldPosition();
    // Offset slightly so plug inserts into socket
    const targetPos = new THREE.Vector3(scooterPortWorld.x - 0.04, scooterPortWorld.y, scooterPortWorld.z);
    const targetRot = new THREE.Euler(0, -0.15, 0);

    if (!animate) {
      this.connectorGroup.position.copy(targetPos);
      this.connectorGroup.rotation.copy(targetRot);
      this.updateCableMesh();
      return;
    }

    gsap.to(this.connectorGroup.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => {
        this.updateCableMesh();
        if (this.station.reelSpool) {
          this.station.reelSpool.rotation.z += 0.3; // Reel rotation
        }
      },
      onComplete: () => {
        audioService.playPlugIn();
      }
    });

    gsap.to(this.connectorGroup.rotation, {
      x: targetRot.x,
      y: targetRot.y,
      z: targetRot.z,
      duration: 1.3,
      ease: 'power2.out'
    });
  }

  // Generate 3D TubeGeometry along CatmullRom spline between outlet and connector
  updateCableMesh() {
    const startPt = this.outletPos.clone();
    const endPt = this.getConnectorTailPos();

    // Calculate curve control points based on distance
    const dist = startPt.distanceTo(endPt);

    const points = [];
    points.push(startPt);

    if (dist < 0.25) {
      // Retracted / holstered: compact neat curve loop
      const mid = new THREE.Vector3(
        (startPt.x + endPt.x) * 0.5 + 0.05,
        Math.min(startPt.y, endPt.y) - 0.08,
        (startPt.z + endPt.z) * 0.5 + 0.04
      );
      points.push(mid);
    } else {
      // Extended or Connected: catenary sag curve
      const sagDepth = Math.min(0.28, dist * 0.35);

      const p1 = new THREE.Vector3(
        startPt.x + (endPt.x - startPt.x) * 0.25,
        Math.max(0.08, Math.min(startPt.y, endPt.y) - sagDepth * 0.8),
        startPt.z + (endPt.z - startPt.z) * 0.25 + 0.06
      );

      const p2 = new THREE.Vector3(
        startPt.x + (endPt.x - startPt.x) * 0.65,
        Math.max(0.08, Math.min(startPt.y, endPt.y) - sagDepth * 0.9),
        startPt.z + (endPt.z - startPt.z) * 0.65 + 0.04
      );

      points.push(p1);
      points.push(p2);
    }

    points.push(endPt);

    const curve = new THREE.CatmullRomCurve3(points);
    curve.curveType = 'centripetal';

    if (this.cableMesh) {
      this.cableMesh.geometry.dispose();
      this.cableMesh.geometry = new THREE.TubeGeometry(curve, 32, 0.012, 10, false);
    } else {
      const geo = new THREE.TubeGeometry(curve, 32, 0.012, 10, false);
      this.cableMesh = new THREE.Mesh(geo, this.materials.cableRubber);
      this.cableMesh.castShadow = true;
      this.group.add(this.cableMesh);
    }
  }

  update(dt = 0.016) {
    const s = systemState;

    // Update connector ring LED color
    if (this.connectorLedRing) {
      if (s.theftAlarm || s.activeFault) {
        this.connectorLedRing.material = this.materials.ledRingRed;
      } else if (s.status === 'CHARGING') {
        this.connectorLedRing.material = this.materials.ledRingGreen;
        const pulse = 1.0 + Math.sin(Date.now() * 0.008) * 0.6;
        this.materials.ledRingGreen.emissiveIntensity = pulse;
      } else {
        this.connectorLedRing.material = this.materials.ledRingCyan;
      }
    }
  }
}

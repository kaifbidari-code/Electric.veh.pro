import * as THREE from 'three';
import { systemState } from '../simulation/systemState.js';

export class ElectricScooter {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Electric_Scooter';

    // Park beside station at x = 1.05m, z = 0.15m
    this.group.position.set(1.05, 0, 0.15);
    this.group.rotation.y = -0.12; // Slight aesthetic angle toward viewer

    this.materials = this.initMaterials();
    this.selectableMeshes = [];

    this.buildWheels();
    this.buildChassisAndFootboard();
    this.buildFrontFairing();
    this.buildHandlebars();
    this.buildSeatAndTail();
    this.buildChargingPort();
    this.buildKickstand();
  }

  initMaterials() {
    return {
      metallicBody: new THREE.MeshStandardMaterial({
        color: 0xd0d8e2,
        metalness: 0.85,
        roughness: 0.25,
        envMapIntensity: 1.2
      }),
      darkBody: new THREE.MeshStandardMaterial({
        color: 0x0f1722,
        metalness: 0.4,
        roughness: 0.15
      }),
      rubberTyre: new THREE.MeshStandardMaterial({
        color: 0x181a1d,
        roughness: 0.92,
        metalness: 0.05
      }),
      alloyRim: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2
      }),
      brakeDisc: new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.95,
        roughness: 0.15
      }),
      seatLeather: new THREE.MeshStandardMaterial({
        color: 0x1e242d,
        roughness: 0.85,
        metalness: 0.08
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.95,
        roughness: 0.05
      }),
      headlightGlass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        roughness: 0.05,
        transmission: 0.8
      }),
      headlightGlow: new THREE.MeshStandardMaterial({
        color: 0x00d9ff,
        emissive: 0x00d9ff,
        emissiveIntensity: 2.0
      }),
      taillightRed: new THREE.MeshStandardMaterial({
        color: 0xff3030,
        emissive: 0xff3030,
        emissiveIntensity: 1.6
      }),
      screenMat: new THREE.MeshBasicMaterial({
        color: 0x00d9ff
      }),
      neonAccent: new THREE.MeshStandardMaterial({
        color: 0x39ff63,
        emissive: 0x39ff63,
        emissiveIntensity: 1.5
      })
    };
  }

  registerSelectable(mesh, info) {
    mesh.userData = {
      isScooterComponent: true,
      ...info
    };
    this.selectableMeshes.push(mesh);
  }

  // 1. WHEELS (Front & Rear with tread, alloy spokes, brake discs, hub motor)
  buildWheels() {
    const wheelRadius = 0.21;
    const tyreWidth = 0.07;

    const createWheel = (isRear) => {
      const wGroup = new THREE.Group();

      // Tyre Torus (treaded profile)
      const tyreGeo = new THREE.TorusGeometry(wheelRadius - 0.035, 0.04, 16, 36);
      const tyre = new THREE.Mesh(tyreGeo, this.materials.rubberTyre);
      tyre.castShadow = true;
      wGroup.add(tyre);

      // Alloy Rim Cylinder
      const rimGeo = new THREE.CylinderGeometry(wheelRadius - 0.04, wheelRadius - 0.04, tyreWidth - 0.015, 24);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, this.materials.alloyRim);
      wGroup.add(rim);

      // Central Hub
      const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, tyreWidth + 0.01, 16);
      hubGeo.rotateX(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, isRear ? this.materials.darkBody : this.materials.chrome);
      wGroup.add(hub);

      // 5-Spoke Alloy Design
      for (let i = 0; i < 5; i++) {
        const spokeGeo = new THREE.BoxGeometry(0.018, wheelRadius - 0.045, 0.016);
        const spoke = new THREE.Mesh(spokeGeo, this.materials.alloyRim);
        const ang = (i * Math.PI * 2) / 5;
        spoke.position.set(Math.sin(ang) * (wheelRadius * 0.4), Math.cos(ang) * (wheelRadius * 0.4), 0);
        spoke.rotation.z = -ang;
        wGroup.add(spoke);
      }

      // Brake Rotor Disc
      const discGeo = new THREE.RingGeometry(0.06, 0.12, 24);
      const disc = new THREE.Mesh(discGeo, this.materials.brakeDisc);
      disc.position.z = 0.042;
      wGroup.add(disc);

      return wGroup;
    };

    // Front Wheel (at z = 0.65m, y = 0.21m)
    this.frontWheel = createWheel(false);
    this.frontWheel.position.set(0, 0.21, 0.65);
    this.group.add(this.frontWheel);

    // Front telescopic suspension forks (left and right)
    [-0.055, 0.055].forEach(x => {
      const forkGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.36, 16);
      const fork = new THREE.Mesh(forkGeo, this.materials.chrome);
      fork.position.set(x, 0.36, 0.63);
      fork.rotation.x = -0.25; // Rake angle
      fork.castShadow = true;
      this.group.add(fork);
    });

    // Front aerodynamic mudguard
    const frontFenderGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.09, 20, 1, false, 0, Math.PI * 0.7);
    frontFenderGeo.rotateZ(Math.PI / 2);
    frontFenderGeo.rotateY(Math.PI * 0.65);
    const frontFender = new THREE.Mesh(frontFenderGeo, this.materials.metallicBody);
    frontFender.position.set(0, 0.22, 0.65);
    frontFender.castShadow = true;
    this.group.add(frontFender);

    // Rear Wheel (at z = -0.55m, y = 0.21m)
    this.rearWheel = createWheel(true);
    this.rearWheel.position.set(0, 0.21, -0.55);
    this.group.add(this.rearWheel);

    // Rear swingarm / hub motor frame
    const swingarmGeo = new THREE.BoxGeometry(0.035, 0.05, 0.45);
    [-0.07, 0.07].forEach(x => {
      const swingarm = new THREE.Mesh(swingarmGeo, this.materials.darkBody);
      swingarm.position.set(x, 0.22, -0.32);
      this.group.add(swingarm);
    });

    this.registerSelectable(this.frontWheel, {
      name: 'High-Efficiency EV Alloy Wheels & Regenerative Hub',
      purpose: 'Low-rolling-resistance tubeless tyres with regenerative brake sensors',
      specs: '12-inch All-Weather Compound, Hydraulic Dual-Piston Discs, 4.5 kW Peak Hub Motor'
    });
  }

  // 2. CHASSIS & FOOTBOARD
  buildChassisAndFootboard() {
    // Under-floor lithium-ion battery casing (0.28 W x 0.12 H x 0.65 L)
    const battGeo = new THREE.BoxGeometry(0.28, 0.10, 0.62);
    const battCasing = new THREE.Mesh(battGeo, this.materials.darkBody);
    battCasing.position.set(0, 0.16, 0.05);
    battCasing.castShadow = true;
    this.group.add(battCasing);

    // Footboard deck (0.34 W x 0.03 H x 0.68 L)
    const deckGeo = new THREE.BoxGeometry(0.34, 0.03, 0.68);
    const deck = new THREE.Mesh(deckGeo, this.materials.metallicBody);
    deck.position.set(0, 0.22, 0.05);
    deck.castShadow = true;
    this.group.add(deck);

    // Anti-slip rubber traction strips on deck
    for (let i = -3; i <= 3; i++) {
      const gripGeo = new THREE.BoxGeometry(0.26, 0.005, 0.02);
      const grip = new THREE.Mesh(gripGeo, this.materials.rubberTyre);
      grip.position.set(0, 0.238, 0.05 + i * 0.08);
      this.group.add(grip);
    }

    this.registerSelectable(deck, {
      name: 'IP67 Under-Floor Battery & Deck Platform',
      purpose: 'Houses the 3.7 kWh high-density NMC Lithium-ion battery pack with active thermal management',
      specs: '3.7 kWh, 51.1V Nominal, 72.4Ah, IP67 Submersion Sealed, Fast-AC Capable'
    });
  }

  // 3. FRONT APRON & HEADLIGHT
  buildFrontFairing() {
    // Aerodynamic curved front apron shield
    const apronGeo = new THREE.BoxGeometry(0.32, 0.60, 0.22);
    const apron = new THREE.Mesh(apronGeo, this.materials.metallicBody);
    apron.position.set(0, 0.52, 0.42);
    apron.rotation.x = -0.22;
    apron.castShadow = true;
    this.group.add(apron);

    // Glossy black center shield insert
    const shieldGeo = new THREE.BoxGeometry(0.18, 0.52, 0.04);
    const shield = new THREE.Mesh(shieldGeo, this.materials.darkBody);
    shield.position.set(0, 0.54, 0.53);
    shield.rotation.x = -0.22;
    this.group.add(shield);

    // Bright projector LED headlight assembly
    const headlightGeo = new THREE.BoxGeometry(0.16, 0.07, 0.03);
    const headlight = new THREE.Mesh(headlightGeo, this.materials.headlightGlow);
    headlight.position.set(0, 0.56, 0.56);
    headlight.rotation.x = -0.22;
    this.group.add(headlight);

    // Front horizontal DRL light bar (Cyan)
    const drlGeo = new THREE.BoxGeometry(0.22, 0.015, 0.02);
    const drl = new THREE.Mesh(drlGeo, this.materials.neonAccent);
    drl.position.set(0, 0.62, 0.55);
    drl.rotation.x = -0.22;
    this.group.add(drl);

    this.registerSelectable(apron, {
      name: 'Aerodynamic Front Fairing & Projector Matrix Headlight',
      purpose: 'Low-drag airflow redirection and daylight-visible LED lighting array',
      specs: 'High-Impact Polycarbonate, Dual 1800-Lumen Projector LEDs, Integrated DRL Guide'
    });
  }

  // 4. HANDLEBARS, MIRRORS & DIGITAL DASHBOARD
  buildHandlebars() {
    // Steering column neck
    const neckGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
    const neck = new THREE.Mesh(neckGeo, this.materials.darkBody);
    neck.position.set(0, 0.85, 0.48);
    neck.rotation.x = -0.22;
    this.group.add(neck);

    // Horizontal handlebar crossbar (0.58m wide)
    const barGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.58, 16);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, this.materials.chrome);
    bar.position.set(0, 1.05, 0.43);
    this.group.add(bar);

    // Handlebar rubber grips (left & right)
    [-0.25, 0.25].forEach(x => {
      const gripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.11, 16);
      gripGeo.rotateZ(Math.PI / 2);
      const grip = new THREE.Mesh(gripGeo, this.materials.rubberTyre);
      grip.position.set(x, 1.05, 0.43);
      this.group.add(grip);

      // Brake levers
      const leverGeo = new THREE.BoxGeometry(0.08, 0.01, 0.015);
      const lever = new THREE.Mesh(leverGeo, this.materials.chrome);
      lever.position.set(x > 0 ? 0.22 : -0.22, 1.05, 0.47);
      this.group.add(lever);

      // Aerodynamic Rearview Mirrors
      const stemGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.14, 12);
      const stem = new THREE.Mesh(stemGeo, this.materials.darkBody);
      stem.position.set(x > 0 ? 0.22 : -0.22, 1.13, 0.41);
      stem.rotation.z = x > 0 ? -0.3 : 0.3;
      this.group.add(stem);

      const mirrorHousingGeo = new THREE.BoxGeometry(0.09, 0.06, 0.02);
      const mirrorHousing = new THREE.Mesh(mirrorHousingGeo, this.materials.metallicBody);
      mirrorHousing.position.set(x > 0 ? 0.26 : -0.26, 1.18, 0.39);
      this.group.add(mirrorHousing);

      const mirrorGlassGeo = new THREE.PlaneGeometry(0.08, 0.05);
      const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, this.materials.chrome);
      mirrorGlass.position.set(x > 0 ? 0.26 : -0.26, 1.18, 0.38);
      mirrorGlass.rotation.y = Math.PI;
      this.group.add(mirrorGlass);
    });

    // 7-Inch Digital TFT Instrument Cluster
    const dashHousingGeo = new THREE.BoxGeometry(0.14, 0.09, 0.03);
    const dashHousing = new THREE.Mesh(dashHousingGeo, this.materials.darkBody);
    dashHousing.position.set(0, 1.03, 0.41);
    dashHousing.rotation.x = 0.55; // Angled up toward rider
    this.group.add(dashHousing);

    const dashScreenGeo = new THREE.PlaneGeometry(0.12, 0.07);
    const dashScreen = new THREE.Mesh(dashScreenGeo, this.materials.screenMat);
    dashScreen.position.set(0, 1.038, 0.398);
    dashScreen.rotation.x = -Math.PI / 2 + 0.55;
    this.group.add(dashScreen);
  }

  // 5. ERGONOMIC DUAL SEAT, SIDE PANELS & REAR TAIL
  buildSeatAndTail() {
    // Lower body side cowls (metallic silver flanks)
    const cowlGeo = new THREE.BoxGeometry(0.36, 0.32, 0.65);
    const cowl = new THREE.Mesh(cowlGeo, this.materials.metallicBody);
    cowl.position.set(0, 0.40, -0.22);
    cowl.castShadow = true;
    this.group.add(cowl);

    // Contoured two-tone leather seat
    const seatGeo = new THREE.BoxGeometry(0.28, 0.09, 0.68);
    const seat = new THREE.Mesh(seatGeo, this.materials.seatLeather);
    seat.position.set(0, 0.60, -0.18);
    seat.castShadow = true;
    this.group.add(seat);

    // Passenger pillion grab rail (aluminum)
    const railGeo = new THREE.TorusGeometry(0.12, 0.012, 12, 24, Math.PI);
    const grabRail = new THREE.Mesh(railGeo, this.materials.chrome);
    grabRail.position.set(0, 0.62, -0.52);
    grabRail.rotation.x = Math.PI / 2;
    this.group.add(grabRail);

    // Slim futuristic red LED taillight bar
    const tailLightGeo = new THREE.BoxGeometry(0.24, 0.025, 0.02);
    const tailLight = new THREE.Mesh(tailLightGeo, this.materials.taillightRed);
    tailLight.position.set(0, 0.52, -0.56);
    this.group.add(tailLight);

    // Rear license bracket and reflector
    const bracketGeo = new THREE.BoxGeometry(0.12, 0.08, 0.02);
    const bracket = new THREE.Mesh(bracketGeo, this.materials.darkBody);
    bracket.position.set(0, 0.38, -0.58);
    this.group.add(bracket);

    this.registerSelectable(seat, {
      name: 'Ergonomic Dual-Rider Seat & 22L Under-Seat Boot',
      purpose: 'Comfort seating with helmet storage and battery thermal isolation barrier',
      specs: 'High-density Memory Foam, Waterproof UV Vinyl, 22-Litre Storage Compartment'
    });
  }

  // 6. CHARGING PORT SOCKET (On left flank facing the station!)
  buildChargingPort() {
    // Port door housing on the left side (x = -0.185, y = 0.48, z = 0.12)
    // Facing directly towards the charging station!
    const portHousingGeo = new THREE.BoxGeometry(0.03, 0.07, 0.07);
    const portHousing = new THREE.Mesh(portHousingGeo, this.materials.darkBody);
    portHousing.position.set(-0.185, 0.48, 0.12);
    this.group.add(portHousing);

    // Open port cavity
    const cavityGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.02, 16);
    cavityGeo.rotateZ(Math.PI / 2);
    const cavity = new THREE.Mesh(cavityGeo, this.materials.rubberTyre);
    cavity.position.set(-0.188, 0.48, 0.12);
    this.group.add(cavity);

    // Illuminated socket halo ring (Cyan / Neon Green)
    const haloGeo = new THREE.RingGeometry(0.022, 0.028, 20);
    haloGeo.rotateY(Math.PI / 2);
    this.portHalo = new THREE.Mesh(haloGeo, this.materials.cyanBlue);
    this.portHalo.position.set(-0.201, 0.48, 0.12);
    this.group.add(this.portHalo);

    // World position anchor for cable plug docking!
    // World coordinates will be calculated dynamically
    this.chargePortAnchor = new THREE.Object3D();
    this.chargePortAnchor.position.set(-0.20, 0.48, 0.12);
    this.group.add(this.chargePortAnchor);

    this.registerSelectable(portHousing, {
      name: 'Weather-Sealed SmartGuard Fast-AC Charging Port',
      purpose: 'Interface connector for automated pilot signal handshake and high-current power transfer',
      specs: 'IEC 62196 Mode 3 Compatible / Proprietary 2-Wheeler Pinout, 230V 16A Continuous, IP67 Sealed Cap'
    });
  }

  // 7. SIDE KICKSTAND
  buildKickstand() {
    const standGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.28, 12);
    const stand = new THREE.Mesh(standGeo, this.materials.darkBody);
    stand.position.set(-0.16, 0.12, -0.05);
    stand.rotation.z = 0.55; // Tilted to ground
    this.group.add(stand);

    const footGeo = new THREE.BoxGeometry(0.04, 0.01, 0.06);
    const foot = new THREE.Mesh(footGeo, this.materials.darkBody);
    foot.position.set(-0.24, 0.005, -0.05);
    this.group.add(foot);
  }

  // Get world coordinate of the scooter charging port
  getPortWorldPosition() {
    const v = new THREE.Vector3();
    this.chargePortAnchor.getWorldPosition(v);
    return v;
  }

  update(dt = 0.016) {
    const s = systemState;
    if (this.portHalo) {
      if (s.status === 'CHARGING') {
        this.portHalo.material = this.materials.neonAccent;
        const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.5;
        this.materials.neonAccent.emissiveIntensity = pulse;
      } else if (s.theftAlarm || s.activeFault) {
        this.portHalo.material = this.materials.taillightRed;
      } else {
        this.portHalo.material = this.materials.headlightGlow;
      }
    }
  }
}

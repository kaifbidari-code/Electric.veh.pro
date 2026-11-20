import * as THREE from 'three';
import { systemState } from '../simulation/systemState.js';
import { ScreenTexture } from './screenTexture.js';

export class ChargingStation {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'SmartGuard_Station';

    // Screen texture
    this.screenTexture = new ScreenTexture();

    // Material dictionary
    this.materials = this.initMaterials();

    // 8 Explodable module groups
    this.modules = {
      canopy: new THREE.Group(),
      ledModule: new THREE.Group(),
      displayModule: new THREE.Group(),
      cableReel: new THREE.Group(),
      sensors: new THREE.Group(),
      protection: new THREE.Group(),
      mainEnclosure: new THREE.Group(),
      baseUnit: new THREE.Group()
    };

    // Keep track of clickable selectable meshes
    this.selectableMeshes = [];

    // Build the station
    this.buildBaseUnit();
    this.buildMainEnclosure();
    this.buildProtectionCompartment();
    this.buildSensorsModule();
    this.buildDisplayModule();
    this.buildCableReelModule();
    this.buildLEDLightingModule();
    this.buildTopCanopy();

    // Add all module groups to main station group
    Object.values(this.modules).forEach(mod => this.group.add(mod));

    // LED indicators references for real-time updates
    this.statusLEDs = [];
  }

  initMaterials() {
    return {
      metallicSilver: new THREE.MeshStandardMaterial({
        color: 0xbfc8d2,
        metalness: 0.88,
        roughness: 0.22,
        envMapIntensity: 1.2
      }),
      glossyBlack: new THREE.MeshStandardMaterial({
        color: 0x080e14,
        metalness: 0.35,
        roughness: 0.08,
        envMapIntensity: 1.5
      }),
      darkMetal: new THREE.MeshStandardMaterial({
        color: 0x1c2430,
        metalness: 0.75,
        roughness: 0.35
      }),
      chassisGray: new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.6,
        roughness: 0.45
      }),
      rubberGasket: new THREE.MeshStandardMaterial({
        color: 0x151922,
        roughness: 0.95,
        metalness: 0.05
      }),
      neonGreen: new THREE.MeshStandardMaterial({
        color: 0x39ff63,
        emissive: 0x39ff63,
        emissiveIntensity: 1.8,
        roughness: 0.2
      }),
      cyanBlue: new THREE.MeshStandardMaterial({
        color: 0x00d9ff,
        emissive: 0x00d9ff,
        emissiveIntensity: 1.5,
        roughness: 0.2
      }),
      dangerRed: new THREE.MeshStandardMaterial({
        color: 0xff3030,
        emissive: 0xff3030,
        emissiveIntensity: 2.0,
        roughness: 0.2
      }),
      warningAmber: new THREE.MeshStandardMaterial({
        color: 0xffb020,
        emissive: 0xffb020,
        emissiveIntensity: 1.8,
        roughness: 0.2
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.85,
        thickness: 0.015
      }),
      copper: new THREE.MeshStandardMaterial({
        color: 0xb87333,
        metalness: 0.9,
        roughness: 0.3
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.95,
        roughness: 0.05
      })
    };
  }

  registerSelectable(mesh, info) {
    mesh.userData = {
      isStationComponent: true,
      ...info
    };
    this.selectableMeshes.push(mesh);
  }

  // 1. BASE UNIT (Floor plinth, 4 anchor bolts, cable inlet conduit)
  buildBaseUnit() {
    const grp = this.modules.baseUnit;
    grp.name = 'Base_Mounting_Unit';

    // Main base plinth (500mm x 400mm x 60mm) -> (0.5m x 0.4m x 0.06m)
    const plinthGeo = new THREE.BoxGeometry(0.50, 0.06, 0.40);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.darkMetal);
    plinth.position.y = 0.03;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    grp.add(plinth);

    // Beveled upper step (0.47 x 0.03 x 0.37)
    const stepGeo = new THREE.BoxGeometry(0.47, 0.03, 0.37);
    const step = new THREE.Mesh(stepGeo, this.materials.metallicSilver);
    step.position.y = 0.075;
    step.castShadow = true;
    grp.add(step);

    // 4 Heavy-duty anchor bolts with washers
    const boltPositions = [
      [-0.22, 0.21, -0.17],
      [0.22, 0.21, -0.17],
      [-0.22, 0.21, 0.17],
      [0.22, 0.21, 0.17]
    ];
    boltPositions.forEach(([x, y, z]) => {
      // Washer
      const washerGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.008, 16);
      const washer = new THREE.Mesh(washerGeo, this.materials.chrome);
      washer.position.set(x, 0.065, z);
      grp.add(washer);

      // Hex nut
      const nutGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.022, 6);
      const nut = new THREE.Mesh(nutGeo, this.materials.metallicSilver);
      nut.position.set(x, 0.08, z);
      nut.castShadow = true;
      grp.add(nut);
    });

    // Underground grid cable inlet conduit
    const conduitGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.15, 16);
    const conduit = new THREE.Mesh(conduitGeo, this.materials.darkMetal);
    conduit.position.set(0, -0.04, -0.08);
    grp.add(conduit);

    this.registerSelectable(plinth, {
      name: 'Base Mounting Unit & Ground Foundation',
      moduleKey: 'baseUnit',
      purpose: 'Structural stability, seismic anchor bolts and sub-grade conduit entry',
      specs: 'M16 Galvanized Anchor Bolts, 500x400mm footprint, IP68 cable entry gland'
    });
  }

  // 2. MAIN WEATHERPROOF ENCLOSURE (Chassis, silver panels, vents, hinges, gaskets)
  buildMainEnclosure() {
    const grp = this.modules.mainEnclosure;
    grp.name = 'Main_Weatherproof_Enclosure';

    // Main column dimensions: 450mm W x 1300mm H x 350mm D (0.45 x 1.30 x 0.35)
    // Centered around y = 0.74 (0.09 to 1.39m)
    const bodyGeo = new THREE.BoxGeometry(0.45, 1.25, 0.35);
    const body = new THREE.Mesh(bodyGeo, this.materials.metallicSilver);
    body.position.y = 0.715;
    body.castShadow = true;
    body.receiveShadow = true;
    grp.add(body);

    // Front black glossy fascia insert (0.40 x 1.20 x 0.02)
    const frontFasciaGeo = new THREE.BoxGeometry(0.40, 1.20, 0.02);
    const frontFascia = new THREE.Mesh(frontFasciaGeo, this.materials.glossyBlack);
    frontFascia.position.set(0, 0.715, 0.176);
    frontFascia.castShadow = true;
    grp.add(frontFascia);

    // Weatherproof rubber perimeter gasket line (Black sealing boundary for IP65)
    const gasketGeo = new THREE.BoxGeometry(0.42, 1.22, 0.008);
    const gasket = new THREE.Mesh(gasketGeo, this.materials.rubberGasket);
    gasket.position.set(0, 0.715, 0.171);
    grp.add(gasket);

    // Side ventilation louver slots (left and right sides, angled louvers for water shedding)
    [-0.226, 0.226].forEach((xPos, sideIdx) => {
      for (let i = 0; i < 6; i++) {
        const louverGeo = new THREE.BoxGeometry(0.005, 0.015, 0.16);
        const louver = new THREE.Mesh(louverGeo, this.materials.darkMetal);
        louver.position.set(xPos, 0.55 + i * 0.035, 0);
        louver.rotation.z = sideIdx === 0 ? 0.3 : -0.3;
        grp.add(louver);
      }
    });

    // Rear maintenance access door hinges and latch
    const hingeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 12);
    [-0.18, 0.18].forEach(x => {
      [0.4, 0.9, 1.2].forEach(y => {
        const hinge = new THREE.Mesh(hingeGeo, this.materials.darkMetal);
        hinge.position.set(x, y, -0.176);
        grp.add(hinge);
      });
    });

    // High Voltage Warning Plate on side
    const badgeGeo = new THREE.PlaneGeometry(0.12, 0.06);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xffb020, side: THREE.DoubleSide });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(-0.226, 0.95, 0.05);
    badge.rotation.y = -Math.PI / 2;
    grp.add(badge);

    this.registerSelectable(body, {
      name: 'Weatherproof Heavy-Gauge Enclosure',
      moduleKey: 'mainEnclosure',
      purpose: 'Corrosion-resistant dual-layer metallic chassis with IP65 ingress protection seals',
      specs: 'Al-Mg Alloy, Powder-coated Anti-UV, Internal water-drainage labyrinth, 1.3m column'
    });
  }

  // 3. ELECTRICAL PROTECTION COMPARTMENT (MCB, Surge arrester, contactor, isolation relay)
  buildProtectionCompartment() {
    const grp = this.modules.protection;
    grp.name = 'Electrical_Protection_Compartment';

    // Din rail sub-chassis mounted internally at y = 0.55, z = -0.05
    const chassisPlateGeo = new THREE.BoxGeometry(0.36, 0.38, 0.03);
    const chassisPlate = new THREE.Mesh(chassisPlateGeo, this.materials.chassisGray);
    chassisPlate.position.set(0, 0.52, -0.05);
    grp.add(chassisPlate);

    // DIN Rail
    const railGeo = new THREE.BoxGeometry(0.32, 0.035, 0.015);
    const rail = new THREE.Mesh(railGeo, this.materials.metallicSilver);
    rail.position.set(0, 0.52, -0.025);
    grp.add(rail);

    // Component 1: 2-Pole Miniature Circuit Breaker (MCB)
    const mcbGeo = new THREE.BoxGeometry(0.05, 0.09, 0.06);
    const mcb = new THREE.Mesh(mcbGeo, this.materials.darkMetal);
    mcb.position.set(-0.11, 0.52, 0.005);
    grp.add(mcb);

    // Breaker switch lever (Orange)
    const leverGeo = new THREE.BoxGeometry(0.02, 0.03, 0.02);
    const lever = new THREE.Mesh(leverGeo, this.materials.warningAmber);
    lever.position.set(-0.11, 0.53, 0.04);
    grp.add(lever);

    // Component 2: Type 2 Surge Protection Device (SPD)
    const spdGeo = new THREE.BoxGeometry(0.06, 0.09, 0.06);
    const spd = new THREE.Mesh(spdGeo, this.materials.metallicSilver);
    spd.position.set(-0.04, 0.52, 0.005);
    grp.add(spd);

    // Component 3: 40A AC Safety Contactor / Isolation Relay (Feature 4 safe isolation)
    const contactorGeo = new THREE.BoxGeometry(0.08, 0.10, 0.07);
    const contactor = new THREE.Mesh(contactorGeo, this.materials.darkMetal);
    contactor.position.set(0.05, 0.52, 0.01);
    grp.add(contactor);

    // Relay status LED (Green = Closed, Red = Isolated)
    const relayLedGeo = new THREE.SphereGeometry(0.008, 12, 12);
    this.relayLed = new THREE.Mesh(relayLedGeo, this.materials.neonGreen);
    this.relayLed.position.set(0.05, 0.575, 0.048);
    grp.add(this.relayLed);

    // Component 4: Earth Leakage (RCD) Sensing Core
    const rcdGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
    const rcd = new THREE.Mesh(rcdGeo, this.materials.copper);
    rcd.rotation.x = Math.PI / 2;
    rcd.position.set(0.12, 0.52, 0.01);
    grp.add(rcd);

    this.registerSelectable(chassisPlate, {
      name: 'Electrical Protection & Safe Isolation Bay',
      moduleKey: 'protection',
      purpose: 'Automatic 6-fault monitoring: Overcurrent, Overvoltage, Undervoltage, Short Circuit, Earth Leakage, and Thermal Breaker',
      specs: 'Dual-pole 32A MCB, 40kA SPD Type II, 30mA RCD, Dual Microcontroller Isolation Relays'
    });
  }

  // 4. TEMPERATURE & SECURITY SENSORS (Feature 2 & Feature 3 hardware)
  buildSensorsModule() {
    const grp = this.modules.sensors;
    grp.name = 'Sensors_Module';

    // Sensor mounting bracket
    const sensorPlateGeo = new THREE.BoxGeometry(0.08, 0.16, 0.02);
    const sensorPlate = new THREE.Mesh(sensorPlateGeo, this.materials.darkMetal);
    sensorPlate.position.set(-0.16, 0.85, 0.10);
    grp.add(sensorPlate);

    // Feature 3: Solid-state temperature probe & copper heatsink fins
    const probeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.05, 12);
    const probe = new THREE.Mesh(probeGeo, this.materials.copper);
    probe.position.set(-0.16, 0.89, 0.12);
    grp.add(probe);

    // Heatsink fins
    for (let i = 0; i < 4; i++) {
      const finGeo = new THREE.BoxGeometry(0.05, 0.003, 0.03);
      const fin = new THREE.Mesh(finGeo, this.materials.metallicSilver);
      fin.position.set(-0.16, 0.85 + i * 0.012, 0.12);
      grp.add(fin);
    }

    // Feature 2: Anti-tamper optical switch & accelerometer PCB
    const pcbGeo = new THREE.BoxGeometry(0.04, 0.04, 0.005);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1a5c28, roughness: 0.4 });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.position.set(-0.16, 0.80, 0.12);
    grp.add(pcb);

    // Tamper security indicator LED
    const tamperLedGeo = new THREE.SphereGeometry(0.007, 12, 12);
    this.tamperLed = new THREE.Mesh(tamperLedGeo, this.materials.neonGreen);
    this.tamperLed.position.set(-0.16, 0.80, 0.13);
    grp.add(this.tamperLed);

    this.registerSelectable(sensorPlate, {
      name: 'SmartGuard Multi-Sensor & Anti-Theft Node',
      moduleKey: 'sensors',
      purpose: 'Continuous thermal tracking (-40°C to +125°C) and cable lock tampering / strain detection',
      specs: 'NTC 10K 1% Precision Thermistor, 3-Axis Gyro/Accelerometer Tamper Lock, ESP32 ADC Bus'
    });
  }

  // 5. DIGITAL TOUCHSCREEN MODULE (Large high-contrast display with dynamic canvas texture)
  buildDisplayModule() {
    const grp = this.modules.displayModule;
    grp.name = 'Digital_Display_Module';

    // Display bezel housing (0.34 x 0.52 x 0.02)
    const bezelGeo = new THREE.BoxGeometry(0.34, 0.52, 0.02);
    const bezel = new THREE.Mesh(bezelGeo, this.materials.darkMetal);
    bezel.position.set(0, 0.98, 0.18);
    grp.add(bezel);

    // Display Screen Mesh with the dynamic CanvasTexture!
    // Screen dimensions: 0.30 W x 0.48 H
    const screenGeo = new THREE.PlaneGeometry(0.30, 0.48);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture.texture,
      toneMapped: false
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.98, 0.191);
    grp.add(screenMesh);

    // Toughened IP65 protective glass cover overlay
    const glassCoverGeo = new THREE.PlaneGeometry(0.32, 0.50);
    const glassCover = new THREE.Mesh(glassCoverGeo, this.materials.glass);
    glassCover.position.set(0, 0.98, 0.193);
    grp.add(glassCover);

    this.registerSelectable(bezel, {
      name: 'Interactive IP65 Digital Touchscreen',
      moduleKey: 'displayModule',
      purpose: 'High-contrast outdoor-readable UI showing real-time battery %, V, A, kW, session metrics & fault codes',
      specs: '10.1" 1000-nit TFT LCD, 4mm Anti-Glare Tempered Glass, Capacitive Touch, IP65 Gasket'
    });
  }

  // 6. CABLE REEL HOUSING & MECHANISM (Circular reel, motorized spool, socket nozzle)
  buildCableReelModule() {
    const grp = this.modules.cableReel;
    grp.name = 'Cable_Reel_Mechanism';

    // Circular reel outer enclosure mounted on lower front / side
    // Position: x = 0.0, y = 0.42, z = 0.19
    const housingOuterGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.07, 32);
    const housingOuter = new THREE.Mesh(housingOuterGeo, this.materials.metallicSilver);
    housingOuter.rotation.x = Math.PI / 2;
    housingOuter.position.set(0, 0.42, 0.18);
    housingOuter.castShadow = true;
    grp.add(housingOuter);

    // Smoky transparent inspection window to see internal reel
    const windowGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.005, 32);
    const windowMesh = new THREE.Mesh(windowGeo, this.materials.glass);
    windowMesh.rotation.x = Math.PI / 2;
    windowMesh.position.set(0, 0.42, 0.218);
    grp.add(windowMesh);

    // Internal rotating reel spool
    this.reelSpool = new THREE.Group();
    this.reelSpool.position.set(0, 0.42, 0.18);

    const spoolCoreGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 24);
    const spoolCore = new THREE.Mesh(spoolCoreGeo, this.materials.darkMetal);
    spoolCore.rotation.x = Math.PI / 2;
    this.reelSpool.add(spoolCore);

    // Coiled cable windings inside the reel
    for (let r = 0; r < 3; r++) {
      const coilTorusGeo = new THREE.TorusGeometry(0.075 + r * 0.016, 0.008, 12, 32);
      const coilMat = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.8 });
      const coil = new THREE.Mesh(coilTorusGeo, coilMat);
      this.reelSpool.add(coil);
    }
    grp.add(this.reelSpool);

    // Cable outlet nozzle & anti-strain boot (lower right of reel)
    const nozzleGeo = new THREE.CylinderGeometry(0.022, 0.028, 0.06, 16);
    const nozzle = new THREE.Mesh(nozzleGeo, this.materials.rubberGasket);
    nozzle.rotation.z = -Math.PI / 4;
    nozzle.position.set(0.12, 0.32, 0.19);
    grp.add(nozzle);

    // Circular LED illumination ring around the cable outlet
    const ledRingGeo = new THREE.TorusGeometry(0.135, 0.006, 16, 32);
    this.reelLedRing = new THREE.Mesh(ledRingGeo, this.materials.neonGreen);
    this.reelLedRing.position.set(0, 0.42, 0.216);
    grp.add(this.reelLedRing);

    // Magnetic docking holster on the right flank where connector parks when retracted
    const holsterGeo = new THREE.BoxGeometry(0.06, 0.10, 0.08);
    const holster = new THREE.Mesh(holsterGeo, this.materials.darkMetal);
    holster.position.set(0.23, 0.42, 0.05);
    grp.add(holster);

    this.registerSelectable(housingOuter, {
      name: 'Automatic Cable Retraction Housing',
      moduleKey: 'cableReel',
      purpose: 'Motorized tension-controlled internal reel with auto-rewind and magnetic anti-theft locking latch',
      specs: '5.0-meter 3x2.5mm² + 2x0.75mm² H07RN-F Cable, BLDC Retraction Motor, 15N Retract Force'
    });
  }

  // 7. LED LIGHTING MODULE (Top light bar, status beacon dome, neon glow trims)
  buildLEDLightingModule() {
    const grp = this.modules.ledModule;
    grp.name = 'LED_Lighting_Module';

    // Status Beacon Dome on top of column (y = 1.34)
    const domeGeo = new THREE.SphereGeometry(0.035, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    this.beaconDome = new THREE.Mesh(domeGeo, this.materials.neonGreen);
    this.beaconDome.position.set(0, 1.34, 0.05);
    grp.add(this.beaconDome);

    // Horizontal Neon Light Bar just under canopy (0.42 x 0.015 x 0.015)
    const barGeo = new THREE.BoxGeometry(0.42, 0.015, 0.015);
    this.canopyLightBar = new THREE.Mesh(barGeo, this.materials.neonGreen);
    this.canopyLightBar.position.set(0, 1.325, 0.176);
    grp.add(this.canopyLightBar);

    // Vertical Cyan Accent Light Strips down the left and right corners
    [-0.20, 0.20].forEach(x => {
      const stripGeo = new THREE.BoxGeometry(0.008, 1.15, 0.008);
      const strip = new THREE.Mesh(stripGeo, this.materials.cyanBlue);
      strip.position.set(x, 0.715, 0.177);
      grp.add(strip);
    });

    this.registerSelectable(this.canopyLightBar, {
      name: 'Multi-Color Status LED Lighting Module',
      moduleKey: 'ledModule',
      purpose: '360° visual status indication: Green = Normal/Ready, Amber = Warning, Red = Theft / Fault Lockout',
      specs: 'Addressable WS2812B RGB Arrays, 1200 Lumens, Daylight-visible Wide-angle Diffuser'
    });
  }

  // 8. TOP CANOPY (Futuristic rain roof, sloped edges, rain deflector, underside illumination)
  buildTopCanopy() {
    const grp = this.modules.canopy;
    grp.name = 'Top_Protective_Canopy';

    // Canopy dimensions: 550mm W x 450mm D x 60mm H (0.55 x 0.45 x 0.06)
    // Position: y = 1.39 (atop main body)
    // Sloped aerodynamic shape: custom extruded profile or multi-box
    const canopyMainGeo = new THREE.BoxGeometry(0.55, 0.05, 0.45);
    const canopyMain = new THREE.Mesh(canopyMainGeo, this.materials.metallicSilver);
    canopyMain.position.set(0, 1.38, 0.05);
    canopyMain.castShadow = true;
    grp.add(canopyMain);

    // Forward aerodynamic sloped lip (rain deflector overhang)
    const lipGeo = new THREE.BoxGeometry(0.55, 0.02, 0.12);
    const lip = new THREE.Mesh(lipGeo, this.materials.glossyBlack);
    lip.position.set(0, 1.395, 0.28);
    lip.rotation.x = -0.18; // Downward slope
    lip.castShadow = true;
    grp.add(lip);

    // Rear sloped water drainage gutter
    const gutterGeo = new THREE.BoxGeometry(0.55, 0.02, 0.08);
    const gutter = new THREE.Mesh(gutterGeo, this.materials.darkMetal);
    gutter.position.set(0, 1.395, -0.19);
    gutter.rotation.x = 0.15;
    grp.add(gutter);

    // Underside downward LED projection panel
    const underLightGeo = new THREE.PlaneGeometry(0.48, 0.38);
    this.underCanopyLight = new THREE.Mesh(underLightGeo, this.materials.cyanBlue);
    this.underCanopyLight.position.set(0, 1.352, 0.05);
    this.underCanopyLight.rotation.x = Math.PI / 2;
    grp.add(this.underCanopyLight);

    this.registerSelectable(canopyMain, {
      name: 'Aerodynamic Weather-Shielding Canopy',
      moduleKey: 'canopy',
      purpose: 'Diverts rainwater, provides sunshade cooling, and houses underside night illumination',
      specs: 'Composite UV-Stabilized Shell, 15° Water-Shed Angle, Integrated Downward Floodlights'
    });
  }

  // Update loop for animations, canvas texture, and LED state colors
  update(dt = 0.016) {
    this.screenTexture.update(dt);

    const s = systemState;

    // Determine current LED state color
    let activeMat = this.materials.neonGreen;
    if (s.theftAlarm) {
      activeMat = (Math.sin(Date.now() * 0.015) > 0) ? this.materials.dangerRed : this.materials.darkMetal;
    } else if (s.activeFault || s.tempState === 'CRITICAL') {
      activeMat = this.materials.dangerRed;
    } else if (s.tempState === 'WARNING' || s.status === 'PAUSED') {
      activeMat = this.materials.warningAmber;
    } else if (s.status === 'COMPLETED' || s.status === 'CONNECTED') {
      activeMat = this.materials.cyanBlue;
    }

    // Apply to lights
    if (this.beaconDome) this.beaconDome.material = activeMat;
    if (this.canopyLightBar) this.canopyLightBar.material = activeMat;
    if (this.reelLedRing) this.reelLedRing.material = activeMat;
    if (this.tamperLed) this.tamperLed.material = s.theftAlarm ? this.materials.dangerRed : this.materials.neonGreen;
    if (this.relayLed) this.relayLed.material = s.isolationRelay === 'CLOSED' ? this.materials.neonGreen : this.materials.dangerRed;

    // Subtle breathing pulse on lights in charging state
    if (s.status === 'CHARGING' && !s.theftAlarm && !s.activeFault) {
      const pulse = 1.2 + Math.sin(Date.now() * 0.005) * 0.6;
      this.materials.neonGreen.emissiveIntensity = pulse;
    } else {
      this.materials.neonGreen.emissiveIntensity = 1.8;
    }
  }
}

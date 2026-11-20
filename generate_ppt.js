import pptxgen from 'pptxgenjs';

async function createPresentation() {
  const pptx = new pptxgen();

  // 16:9 widescreen presentation
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'SmartGuard EV Engineering Team';
  pptx.company = 'SmartGuard EV';
  pptx.title = 'SmartGuard EV - Interactive 3D Charging Station Presentation';

  // Cyber Industrial Color Palette
  const C_DARK_BG = '030B14';
  const C_CARD_BG = '071A2A';
  const C_NEON_GREEN = '39FF63';
  const C_CYAN = '00D9FF';
  const C_SILVER = 'BFC8D2';
  const C_WHITE = 'FFFFFF';
  const C_AMBER = 'FFB020';
  const C_RED = 'FF3030';
  const FONT_HEAD = 'Arial';
  const FONT_BODY = 'Calibri';

  // Helper to add dark slide background and header
  function createBaseSlide(title, category = 'SMARTGUARD EV ENGINEERING') {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    // Top Category / Tagline badge
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.4,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      fontFace: FONT_HEAD,
      color: C_NEON_GREEN,
      bold: true,
      letterSpacing: 2
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.65,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      fontFace: FONT_HEAD,
      color: C_WHITE,
      bold: true
    });

    // Accent line below title
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.25,
      w: 11.7,
      h: 0.03,
      fill: { color: C_CYAN }
    });

    // Bottom footer
    slide.addText('SMARTGUARD EV  •  SMART, SECURE & WEATHERPROOF CHARGING STATION', {
      x: 0.8,
      y: 7.0,
      w: 10.0,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT_BODY,
      color: C_SILVER
    });

    return slide;
  }

  // ==========================================
  // SLIDE 1: TITLE SLIDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_DARK_BG };

    // Brand Badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y: 1.6,
      w: 3.2,
      h: 0.45,
      fill: { color: C_CARD_BG },
      line: { color: C_NEON_GREEN, width: 1.5 },
      rectRadius: 0.2
    });
    slide.addText('⚡ NEXT-GEN EV MOBILITY', {
      x: 1.0,
      y: 1.6,
      w: 3.2,
      h: 0.45,
      fontSize: 11,
      fontFace: FONT_HEAD,
      color: C_NEON_GREEN,
      bold: true,
      align: 'center'
    });

    // Main Title
    slide.addText('SMARTGUARD EV', {
      x: 1.0,
      y: 2.3,
      w: 11.0,
      h: 1.1,
      fontSize: 48,
      fontFace: FONT_HEAD,
      color: C_WHITE,
      bold: true
    });

    // Subtitle
    slide.addText('Smart, Secure and Weatherproof Electric Two-Wheeler Charging Station', {
      x: 1.0,
      y: 3.4,
      w: 10.5,
      h: 0.6,
      fontSize: 20,
      fontFace: FONT_BODY,
      color: C_CYAN
    });

    slide.addText('Charge Smart. Ride Confident.', {
      x: 1.0,
      y: 4.0,
      w: 8.0,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_BODY,
      color: C_SILVER,
      italic: true
    });

    // Feature highlights box
    const specs = [
      { num: '3.6 kW', label: 'Fast-AC Charging' },
      { num: 'IP65', label: 'Weather Target' },
      { num: '7-in-1', label: 'Safety System' },
      { num: 'ESP32', label: 'IoT Controller' }
    ];

    specs.forEach((item, idx) => {
      const bx = 1.0 + idx * 2.8;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: bx,
        y: 4.8,
        w: 2.5,
        h: 1.4,
        fill: { color: C_CARD_BG },
        line: { color: C_CYAN, width: 1 },
        rectRadius: 0.15
      });
      slide.addText(item.num, {
        x: bx,
        y: 5.0,
        w: 2.5,
        h: 0.5,
        fontSize: 24,
        fontFace: FONT_HEAD,
        color: C_NEON_GREEN,
        bold: true,
        align: 'center'
      });
      slide.addText(item.label, {
        x: bx,
        y: 5.55,
        w: 2.5,
        h: 0.4,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_SILVER,
        align: 'center'
      });
    });

    slide.addText('Interactive 3D Engineering & Technology Demonstration', {
      x: 1.0,
      y: 6.8,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: C_SILVER
    });
  }

  // ==========================================
  // SLIDE 2: PROBLEM STATEMENT & MOTIVATION
  // ==========================================
  {
    const slide = createBaseSlide('The Outdoor EV Charging Dilemma', 'INDUSTRY CONTEXT & CHALLENGES');

    const problems = [
      {
        title: 'Cable Clutter & Tripping Hazards',
        desc: 'Unmanaged dangling cables left on parking surfaces create pedestrian tripping risks and undergo severe tyre crushing damage.',
        icon: '⚠️'
      },
      {
        title: 'Monsoon Rain & Harsh Weather Exposure',
        desc: 'Outdoor charging points in tropical and monsoon climates face water ingress, insulation breakdown, and dust storms without robust sealing.',
        icon: '🌧️'
      },
      {
        title: 'Cable Theft & Copper Vandalism',
        desc: 'Unattended public charging stations regularly suffer from cut cables, stolen charging cords, and unauthorized physical tampering.',
        icon: '🔒'
      },
      {
        title: 'Thermal & Electrical Hazards',
        desc: 'High-current 16A charging over extended hours generates contactor thermal buildup with lack of automatic pre-emptive thermal cutoff.',
        icon: '🔥'
      }
    ];

    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const px = 0.8 + col * 5.9;
      const py = 1.6 + row * 2.5;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: px,
        y: py,
        w: 5.6,
        h: 2.2,
        fill: { color: C_CARD_BG },
        line: { color: C_RED, width: 1 },
        rectRadius: 0.15
      });

      slide.addText(`${p.icon}  ${p.title}`, {
        x: px + 0.3,
        y: py + 0.3,
        w: 5.0,
        h: 0.5,
        fontSize: 16,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });

      slide.addText(p.desc, {
        x: px + 0.3,
        y: py + 0.85,
        w: 5.0,
        h: 1.1,
        fontSize: 13,
        fontFace: FONT_BODY,
        color: C_SILVER,
        lineSpacing: 20
      });
    });
  }

  // ==========================================
  // SLIDE 3: THE SMARTGUARD EV SOLUTION
  // ==========================================
  {
    const slide = createBaseSlide('Introducing SmartGuard EV', 'VALUE PROPOSITION & ARCHITECTURE');

    slide.addText('A next-generation, high-reliability outdoor charging station designed specifically for electric two-wheelers, integrating motorized cable retraction, active safety surveillance, and cloud telemetry.', {
      x: 0.8,
      y: 1.5,
      w: 11.5,
      h: 0.8,
      fontSize: 15,
      fontFace: FONT_BODY,
      color: C_CYAN
    });

    const pillars = [
      {
        title: 'Automated Cable Reel',
        desc: 'Motorized internal winding spool automatically extends and rewinds 5m cable, eliminating ground wear and water puddle contact.',
        color: C_NEON_GREEN
      },
      {
        title: '7-in-1 Safety System',
        desc: 'Comprehensive multi-hazard defense: theft alarm, thermal cutoff, 6 electrical fault trips, IP65 weather seals, and fail-safe relays.',
        color: C_CYAN
      },
      {
        title: 'Interactive 3D Interface',
        desc: 'High-contrast 10.1" digital touchscreen with dynamic telemetry synchronized to an ESP32 dual-core IoT edge controller.',
        color: C_AMBER
      }
    ];

    pillars.forEach((pil, idx) => {
      const px = 0.8 + idx * 3.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: px,
        y: 2.6,
        w: 3.7,
        h: 4.0,
        fill: { color: C_CARD_BG },
        line: { color: pil.color, width: 1.5 },
        rectRadius: 0.15
      });

      slide.addText(`0${idx + 1}`, {
        x: px + 0.3,
        y: 2.9,
        w: 3.1,
        h: 0.5,
        fontSize: 26,
        fontFace: FONT_HEAD,
        color: pil.color,
        bold: true
      });

      slide.addText(pil.title, {
        x: px + 0.3,
        y: 3.5,
        w: 3.1,
        h: 0.6,
        fontSize: 18,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });

      slide.addText(pil.desc, {
        x: px + 0.3,
        y: 4.2,
        w: 3.1,
        h: 2.1,
        fontSize: 13,
        fontFace: FONT_BODY,
        color: C_SILVER,
        lineSpacing: 22
      });
    });
  }

  // ==========================================
  // SLIDE 4: 3D CHARGING STATION & SCOOTER MODEL
  // ==========================================
  {
    const slide = createBaseSlide('Industrial Product Design & Proportions', '3D CAD & PHYSICAL MODELING');

    const specsCol = [
      { label: 'Total Height', val: '1500 mm (1.5 m)' },
      { label: 'Main Enclosure', val: '1300 mm × 450 mm × 350 mm' },
      { label: 'Protective Canopy', val: '550 mm × 450 mm (15° slope)' },
      { label: 'Mounting Base Plinth', val: '500 mm × 400 mm with 4× M16 bolts' },
      { label: 'Materials & Finish', val: 'Al-Mg Alloy Silver, Obsidian Gloss Black' },
      { label: 'Digital Interface', val: '10.1" TFT LCD (1000 nits, IP65 Gasket)' }
    ];

    // Left Specifications Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 5.6,
      h: 5.0,
      fill: { color: C_CARD_BG },
      line: { color: C_CYAN, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Charging Station Dimensions & Materials', {
      x: 1.1,
      y: 1.9,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_HEAD,
      color: C_NEON_GREEN,
      bold: true
    });

    specsCol.forEach((item, i) => {
      const iy = 2.4 + i * 0.65;
      slide.addText(item.label.toUpperCase(), {
        x: 1.1,
        y: iy,
        w: 5.0,
        h: 0.25,
        fontSize: 10,
        fontFace: FONT_HEAD,
        color: C_SILVER,
        bold: true
      });
      slide.addText(item.val, {
        x: 1.1,
        y: iy + 0.22,
        w: 5.0,
        h: 0.35,
        fontSize: 14,
        fontFace: FONT_BODY,
        color: C_WHITE
      });
    });

    // Right Electric Scooter Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.6,
      w: 5.6,
      h: 5.0,
      fill: { color: C_CARD_BG },
      line: { color: C_NEON_GREEN, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Paired Electric Scooter & Flexible Cable', {
      x: 7.1,
      y: 1.9,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_HEAD,
      color: C_CYAN,
      bold: true
    });

    const scooterDetails = [
      { title: 'Wheels & Regen Hub', desc: '12-inch treaded rubber tyres with 5-spoke alloy rims and hydraulic disc rotors.' },
      { title: 'Aerodynamic Apron', desc: 'Front fairing with dual matrix LED headlights and horizontal Cyan DRL strip.' },
      { title: 'Ergonomic Bodywork', desc: 'Dual-rider seat, textured traction footboard, handlebar controls, and rearview mirrors.' },
      { title: 'Connected Charging Cable', desc: 'Real-time 3D Catmull-Rom spline with physical plug inserted into scooter port.' }
    ];

    scooterDetails.forEach((sd, i) => {
      const sy = 2.45 + i * 1.0;
      slide.addText(`• ${sd.title}`, {
        x: 7.1,
        y: sy,
        w: 5.0,
        h: 0.3,
        fontSize: 14,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });
      slide.addText(sd.desc, {
        x: 7.3,
        y: sy + 0.3,
        w: 4.8,
        h: 0.6,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_SILVER
      });
    });
  }

  // ==========================================
  // SLIDE 5: EXPLODED ENGINEERING VIEW (8 MODULES)
  // ==========================================
  {
    const slide = createBaseSlide('Exploded Engineering Teardown', 'MODULAR 3D SUB-ASSEMBLIES');

    slide.addText('The 3D model features interactive disassembly into 8 precision-engineered physical modules with guide lines:', {
      x: 0.8,
      y: 1.5,
      w: 11.5,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: C_CYAN
    });

    const modules = [
      { id: '01', name: 'Top Canopy', spec: 'UV-Stabilized ABS, 15° rain slope' },
      { id: '02', name: 'LED Status Module', spec: 'WS2812B RGB 360° beacon dome' },
      { id: '03', name: 'Touchscreen LCD', spec: '10.1" 1000-nit panel with tempered glass' },
      { id: '04', name: 'Cable Reel Drum', spec: 'BLDC motor & 5.0m H07RN-F cable' },
      { id: '05', name: 'Multi-Sensor Node', spec: 'NTC 10K thermistor & anti-tamper gyro' },
      { id: '06', name: 'Protection Bay', spec: '32A MCB, 40kA SPD, 30mA RCD, relays' },
      { id: '07', name: 'Weather Enclosure', spec: 'Al-Mg alloy with louvered ventilation' },
      { id: '08', name: 'Base Mounting Unit', spec: 'Ground plinth with 4× M16 anchor bolts' }
    ];

    modules.forEach((mod, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const mx = 0.8 + col * 2.95;
      const my = 2.2 + row * 2.3;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: mx,
        y: my,
        w: 2.75,
        h: 2.0,
        fill: { color: C_CARD_BG },
        line: { color: C_CYAN, width: 1 },
        rectRadius: 0.12
      });

      slide.addText(mod.id, {
        x: mx + 0.2,
        y: my + 0.2,
        w: 2.35,
        h: 0.35,
        fontSize: 18,
        fontFace: FONT_HEAD,
        color: C_NEON_GREEN,
        bold: true
      });

      slide.addText(mod.name, {
        x: mx + 0.2,
        y: my + 0.6,
        w: 2.35,
        h: 0.45,
        fontSize: 14,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });

      slide.addText(mod.spec, {
        x: mx + 0.2,
        y: my + 1.1,
        w: 2.35,
        h: 0.75,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_SILVER
      });
    });
  }

  // ==========================================
  // SLIDE 6: 7-IN-1 PROTECTION SYSTEM (FEATURES 1-3)
  // ==========================================
  {
    const slide = createBaseSlide('7-in-1 Protection System (Part 1)', 'SAFETY & DEFENSE SUBSYSTEMS');

    const featsPart1 = [
      {
        num: 'FEATURE 01',
        title: 'Automatic Cable Retraction',
        sub: 'Motorized Tension-Controlled Reel',
        points: [
          '3D circular reel with internal rotating drum.',
          'Automatically rewinds 5m cable upon disconnection.',
          'Eliminates ground tripping hazards and water immersion.',
          'Interactive buttons: EXTEND CABLE and RETRACT CABLE.'
        ],
        color: C_NEON_GREEN
      },
      {
        num: 'FEATURE 02',
        title: 'Cable Theft & Tampering Detection',
        sub: 'Continuous Continuity Loop & Strain Gauges',
        points: [
          'Detects unauthorized pulls, cuts, or mechanical tampering.',
          'Instant audible alarm siren and flashing red beacon.',
          'Trips safety isolation relays to safe OPEN state.',
          'Interactive button: SIMULATE CABLE THEFT with disarm reset.'
        ],
        color: C_RED
      },
      {
        num: 'FEATURE 03',
        title: 'Internal Temperature Monitoring',
        sub: 'Precision Thermistors & Thermal Cutoff',
        points: [
          'Dual NTC thermistors near contactors and cable drum.',
          'Three states: Normal (<45°C), Warning (45-65°C), Critical (>65°C).',
          'Automatic charging shutdown when critical temperature exceeded.',
          'Interactive temperature simulation slider (20°C to 85°C).'
        ],
        color: C_AMBER
      }
    ];

    featsPart1.forEach((f, idx) => {
      const fx = 0.8 + idx * 3.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: fx,
        y: 1.6,
        w: 3.7,
        h: 5.0,
        fill: { color: C_CARD_BG },
        line: { color: f.color, width: 1.5 },
        rectRadius: 0.15
      });

      slide.addText(f.num, {
        x: fx + 0.3,
        y: 1.85,
        w: 3.1,
        h: 0.3,
        fontSize: 11,
        fontFace: FONT_HEAD,
        color: f.color,
        bold: true
      });

      slide.addText(f.title, {
        x: fx + 0.3,
        y: 2.2,
        w: 3.1,
        h: 0.65,
        fontSize: 16,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });

      slide.addText(f.sub, {
        x: fx + 0.3,
        y: 2.85,
        w: 3.1,
        h: 0.4,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_CYAN
      });

      const bullets = f.points.map(p => `•  ${p}`).join('\n\n');
      slide.addText(bullets, {
        x: fx + 0.3,
        y: 3.4,
        w: 3.1,
        h: 3.0,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_SILVER,
        lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 7: 7-IN-1 PROTECTION SYSTEM (FEATURES 4-7)
  // ==========================================
  {
    const slide = createBaseSlide('7-in-1 Protection System (Part 2)', 'ELECTRICAL, WEATHER & IOT MONITORING');

    const featsPart2 = [
      {
        num: 'FEATURE 04',
        title: '6-Fault Electrical Detection',
        desc: 'Hardware trips for Overcurrent (24A), Overvoltage (270V), Undervoltage (180V), Short Circuit, 30mA Earth Leakage, and Thermal Breaker with relay isolation.',
        tag: 'Contactor Relays',
        color: C_RED
      },
      {
        num: 'FEATURE 05',
        title: 'Water & Dust Protection',
        desc: 'Dual-layer silicone gaskets, sloped canopy deflector, sealed touchscreen bezel, and downward cable outlet designed for IP65 rating. Includes 3D Rain and Dust simulation.',
        tag: 'IP65 Design Target',
        color: C_CYAN
      },
      {
        num: 'FEATURE 06',
        title: 'Real-Time 3D Touchscreen',
        desc: '10.1" digital display mapped onto 3D station showing real-time battery %, V, A, kW, session timer, and operating state machine (Idle, Connected, Charging, Completed, Fault).',
        tag: 'CanvasTexture HUD',
        color: C_NEON_GREEN
      },
      {
        num: 'FEATURE 07',
        title: 'Remote Maintenance Alerts',
        desc: 'ESP32 IoT cloud telemetry streaming live health, session history, and instant maintenance notifications with operator acknowledge and clear capabilities.',
        tag: 'IoT Telemetry Node',
        color: C_AMBER
      }
    ];

    featsPart2.forEach((f, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const fx = 0.8 + col * 5.9;
      const fy = 1.6 + row * 2.5;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: fx,
        y: fy,
        w: 5.6,
        h: 2.25,
        fill: { color: C_CARD_BG },
        line: { color: f.color, width: 1.2 },
        rectRadius: 0.15
      });

      slide.addText(`${f.num}  |  ${f.tag}`, {
        x: fx + 0.3,
        y: fy + 0.25,
        w: 5.0,
        h: 0.3,
        fontSize: 10,
        fontFace: FONT_HEAD,
        color: f.color,
        bold: true
      });

      slide.addText(f.title, {
        x: fx + 0.3,
        y: fy + 0.55,
        w: 5.0,
        h: 0.45,
        fontSize: 16,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });

      slide.addText(f.desc, {
        x: fx + 0.3,
        y: fy + 1.05,
        w: 5.0,
        h: 1.05,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_SILVER,
        lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 8: 5-STEP WORKING PROCESS
  // ==========================================
  {
    const slide = createBaseSlide('End-to-End Operational Workflow', 'AUTOMATED 5-STEP PROCESS');

    const steps = [
      { num: '01', title: 'Park & Handshake', desc: 'Scooter arrives at dedicated EV bay; ultrasonic sensors establish pilot readiness.' },
      { num: '02', title: 'Extend & Connect', desc: 'Reel unlocks; operator extends 5m cable and plugs into scooter; magnetic lock engages.' },
      { num: '03', title: 'Monitor & Protect', desc: '7-in-1 protection system verifies safety parameters, contactors close, 3.6kW starts.' },
      { num: '04', title: 'Stream Telemetry', desc: 'ESP32 IoT controller streams live V, A, kW, battery %, and temperature to dashboard.' },
      { num: '05', title: 'Safe Auto-Retract', desc: 'Battery hits 100%, contactors isolate safely, plug uncouples, cable auto-rewinds.' }
    ];

    steps.forEach((st, idx) => {
      const sx = 0.8 + idx * 2.36;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: sx,
        y: 1.8,
        w: 2.15,
        h: 4.8,
        fill: { color: C_CARD_BG },
        line: { color: idx === 2 ? C_NEON_GREEN : C_CYAN, width: 1.2 },
        rectRadius: 0.15
      });

      slide.addText(`STEP`, {
        x: sx + 0.2,
        y: 2.1,
        w: 1.75,
        h: 0.25,
        fontSize: 10,
        fontFace: FONT_HEAD,
        color: C_SILVER,
        align: 'center'
      });

      slide.addText(st.num, {
        x: sx + 0.2,
        y: 2.35,
        w: 1.75,
        h: 0.6,
        fontSize: 32,
        fontFace: FONT_HEAD,
        color: C_NEON_GREEN,
        bold: true,
        align: 'center'
      });

      slide.addText(st.title, {
        x: sx + 0.2,
        y: 3.1,
        w: 1.75,
        h: 0.65,
        fontSize: 14,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true,
        align: 'center'
      });

      slide.addText(st.desc, {
        x: sx + 0.2,
        y: 3.85,
        w: 1.75,
        h: 2.4,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_SILVER,
        align: 'center',
        lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 9: REMOTE IOT MONITORING DASHBOARD
  // ==========================================
  {
    const slide = createBaseSlide('Remote IoT Monitoring Dashboard', 'OPERATOR TELEMETRY & ANALYTICS');

    // Left: Live Charts description
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 5.6,
      h: 5.0,
      fill: { color: C_CARD_BG },
      line: { color: C_CYAN, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Real-Time Chart.js Visualizations', {
      x: 1.1,
      y: 1.9,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_HEAD,
      color: C_NEON_GREEN,
      bold: true
    });

    const charts = [
      { name: 'Internal Temperature Profile (°C)', note: 'Dynamic coloring: Blue (<45°C), Amber (45-65°C), Red (>65°C Cutoff).' },
      { name: 'Output Charging Power Curve (kW)', note: 'Tracks 3.68 kW nominal power delivery with realistic grid micro-fluctuations.' },
      { name: 'Scooter Battery Charge Curve (%)', note: 'Cumulative state of charge progress over the session duration.' }
    ];

    charts.forEach((ch, idx) => {
      const cy = 2.45 + idx * 1.3;
      slide.addText(`📈 ${ch.name}`, {
        x: 1.1,
        y: cy,
        w: 5.0,
        h: 0.35,
        fontSize: 13,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });
      slide.addText(ch.note, {
        x: 1.4,
        y: cy + 0.35,
        w: 4.7,
        h: 0.65,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_SILVER
      });
    });

    // Right: Fleet KPIs & Maintenance Alerts
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.6,
      w: 5.6,
      h: 5.0,
      fill: { color: C_CARD_BG },
      line: { color: C_NEON_GREEN, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Station KPIs & Proactive Alert Center', {
      x: 7.1,
      y: 1.9,
      w: 5.0,
      h: 0.4,
      fontSize: 16,
      fontFace: FONT_HEAD,
      color: C_CYAN,
      bold: true
    });

    const alerts = [
      { type: 'SECURITY ALERT', desc: 'Cable tampering detected; magnetic lock strain trigger.' },
      { type: 'THERMAL SHUTDOWN', desc: 'Contactor temperature exceeded 65°C emergency threshold.' },
      { type: 'ELECTRICAL FAULT', desc: 'Overcurrent trip (24.2A) isolated by safe contactor relay.' },
      { type: 'MAINTENANCE DUE', desc: 'Filter seal inspection reminder after 500 operating hours.' }
    ];

    alerts.forEach((al, idx) => {
      const ay = 2.45 + idx * 1.0;
      slide.addText(`🔔 [${al.type}]`, {
        x: 7.1,
        y: ay,
        w: 5.0,
        h: 0.3,
        fontSize: 12,
        fontFace: FONT_HEAD,
        color: al.type.includes('ALERT') || al.type.includes('FAULT') ? C_RED : C_AMBER,
        bold: true
      });
      slide.addText(al.desc, {
        x: 7.3,
        y: ay + 0.3,
        w: 4.8,
        h: 0.55,
        fontSize: 11,
        fontFace: FONT_BODY,
        color: C_SILVER
      });
    });
  }

  // ==========================================
  // SLIDE 10: PROPOSED TECHNICAL SPECIFICATIONS
  // ==========================================
  {
    const slide = createBaseSlide('Proposed Technical Specifications', 'PROTOTYPE RATINGS & STANDARDS');

    const tableData = [
      [
        { text: 'Subsystem', options: { bold: true, color: C_CYAN, fill: C_CARD_BG } },
        { text: 'Design Parameter', options: { bold: true, color: C_CYAN, fill: C_CARD_BG } },
        { text: 'Proposed Configuration', options: { bold: true, color: C_CYAN, fill: C_CARD_BG } },
        { text: 'Standard Reference', options: { bold: true, color: C_CYAN, fill: C_CARD_BG } }
      ],
      ['Input Power', 'Nominal AC Voltage', '230V AC ±10%, 50/60 Hz', 'IEC 60038 Grid'],
      ['Output Rating', 'Continuous Current & Power', '16A (3.68 kW Nominal)', 'IEC 61851-1 Mode 3'],
      ['Enclosure Target', 'Ingress Protection', 'IP65 (Dust-tight, water jets)', 'IEC 60529 Target'],
      ['Impact Resistance', 'Armor Rating', 'IK10 Vandal-Resistant Enclosure', 'EN 62262 Spec'],
      ['Controller', 'Embedded Processor', 'Dual-Core ESP32 240MHz (RTOS)', 'Espressif IoT'],
      ['Connectivity', 'Wireless Telemetry', '4G LTE-M / Wi-Fi / BLE 5.0', 'OCPP 1.6J / 2.0.1'],
      ['Cable Mechanism', 'Automatic Retraction', '5.0m Motorized Drum (H07RN-F)', 'Tension Governed'],
      ['Security System', 'Anti-Theft Protection', 'Continuity Loop + Strain Sensor', 'Proprietary Lock'],
      ['Thermal Cutoff', 'Max Temperature Trip', '>65°C Auto Relay Isolation', 'IEC 60364-4-42']
    ];

    slide.addTable(tableData, {
      x: 0.8,
      y: 1.6,
      w: 11.6,
      h: 5.0,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: C_SILVER,
      border: { pt: 0.5, color: '1A3A54' },
      align: 'left',
      valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 11: APPLICATIONS & TARGET MARKET
  // ==========================================
  {
    const slide = createBaseSlide('Target Deployment Applications', 'URBAN MOBILITY HUBS');

    const apps = [
      { icon: '🏢', title: 'Residential Apartments', desc: 'Organized outdoor charging bays for gated societies eliminating dangling cord hazards.' },
      { icon: '🎓', title: 'Universities & Campuses', desc: 'Safe student EV infrastructure with tamper sirens and anti-theft cable locking.' },
      { icon: '💼', title: 'Corporate Tech Parks', desc: 'Daytime workforce EV charging with RFID access control and cloud billing integration.' },
      { icon: '🛍️', title: 'Shopping Malls & Retail', desc: 'Weatherproof customer charging pods increasing dwell time and customer retention.' },
      { icon: '🚇', title: 'Metro & Transit Stations', desc: 'Durable, vandal-resistant last-mile mobility charging for commuter electric fleets.' }
    ];

    apps.forEach((a, idx) => {
      const col = idx < 3 ? idx : idx - 3;
      const row = idx < 3 ? 0 : 1;
      const ax = idx < 3 ? 0.8 + col * 3.9 : 2.75 + col * 3.9;
      const ay = 1.8 + row * 2.5;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: ax,
        y: ay,
        w: 3.7,
        h: 2.2,
        fill: { color: C_CARD_BG },
        line: { color: C_NEON_GREEN, width: 1 },
        rectRadius: 0.15
      });

      slide.addText(`${a.icon}  ${a.title}`, {
        x: ax + 0.25,
        y: ay + 0.3,
        w: 3.2,
        h: 0.45,
        fontSize: 15,
        fontFace: FONT_HEAD,
        color: C_WHITE,
        bold: true
      });

      slide.addText(a.desc, {
        x: ax + 0.25,
        y: ay + 0.8,
        w: 3.2,
        h: 1.15,
        fontSize: 12,
        fontFace: FONT_BODY,
        color: C_SILVER,
        lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 12: CONCLUSION, LIVE DEMO & Q&A
  // ==========================================
  {
    const slide = createBaseSlide('Conclusion & Interactive Demonstration', 'SUMMARY & Q&A');

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.6,
      w: 11.6,
      h: 4.8,
      fill: { color: C_CARD_BG },
      line: { color: C_NEON_GREEN, width: 1.5 },
      rectRadius: 0.2
    });

    slide.addText('Key Takeaways & Impact', {
      x: 1.2,
      y: 1.9,
      w: 10.8,
      h: 0.4,
      fontSize: 18,
      fontFace: FONT_HEAD,
      color: C_NEON_GREEN,
      bold: true
    });

    const summaryPoints = [
      'Addresses critical outdoor EV pain points: cable clutter, water damage, theft, and thermal runaway.',
      'Comprehensive Seven-in-One protection verified through interactive 3D simulations.',
      'Modular architecture ready for future IoT smart grid integration and OCPP 2.0.1 compliance.',
      'Live interactive 3D demonstration running locally at http://localhost:3000/.'
    ];

    summaryPoints.forEach((sp, idx) => {
      slide.addText(`✔  ${sp}`, {
        x: 1.2,
        y: 2.5 + idx * 0.6,
        w: 10.8,
        h: 0.45,
        fontSize: 14,
        fontFace: FONT_BODY,
        color: C_WHITE
      });
    });

    // Demo URL Callout Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.2,
      y: 5.0,
      w: 10.8,
      h: 1.0,
      fill: { color: C_DARK_BG },
      line: { color: C_CYAN, width: 1 },
      rectRadius: 0.1
    });

    slide.addText('🌐 LIVE INTERACTIVE 3D PROTOTYPE DEMO:  http://localhost:3000/', {
      x: 1.2,
      y: 5.25,
      w: 10.8,
      h: 0.5,
      fontSize: 16,
      fontFace: FONT_HEAD,
      color: C_CYAN,
      bold: true,
      align: 'center'
    });
  }

  // Save the presentation
  const fileName = 'SmartGuard_EV_Presentation.pptx';
  await pptx.writeFile({ fileName });
  console.log(`Presentation generated successfully: ${fileName}`);
}

createPresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});

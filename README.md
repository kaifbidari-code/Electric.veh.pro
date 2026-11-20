# SMARTGUARD EV – Smart, Secure and Weatherproof Electric Two-Wheeler Charging Station

> **Tagline:** *Charge Smart. Ride Confident.*  
> **Target:** Next-Generation Smart Fast-AC Charging Infrastructure for Electric Scooters and Two-Wheelers.

---

## 🚀 Overview

**SmartGuard EV** is a complete, interactive 3D electric mobility demonstration website showcasing a next-generation smart charging station purpose-built for electric two-wheelers. The station integrates an automated cable retraction reel, real-time touchscreen telemetry, and an industrial 7-in-1 multi-hazard protection system.

Built using **HTML5, CSS3, Vanilla JavaScript (ES6+), Three.js, GSAP, and Chart.js**, the project runs locally via **Vite**.

---

## ⚡ Key Features

### 1. Complete 3D Charging Station & Electric Scooter
- **3D Charging Station:**
  - Prototype Dimensions: 1500 mm (H) × 450 mm (W) × 350 mm (D) with an extended 550 mm canopy.
  - Metallic silver chassis (`#BFC8D2`) with glossy black fascia (`#080E14`), ventilation louvers, rear service door, and 4 heavy-duty M16 anchor bolts.
  - Active 10.1" TFT digital touchscreen rendered as a real-time dynamic HTML5 CanvasTexture.
- **Realistic Electric Scooter:**
  - 12-inch treaded rubber tyres, alloy rims with regenerative hub motor, disc brakes, front telescopic suspension fork.
  - Contoured aerodynamic front apron with projector LED matrix headlight and Cyan DRL bar.
  - Dual seat, footboard with rubber traction ribs, rear taillight, side kickstand, and open illuminated charging port.
- **Dynamic Flexible Cable:**
  - Real-time 3D Catmull-Rom spline tube connecting the station outlet nozzle to the scooter charging port with natural catenary sag and physical plug insertion.

### 2. Mandatory Seven-in-One Protection System
1. **Automatic Cable Retraction:** Motorized internal reel spool with continuous tension control; automatically winds back 5.0m H07RN-F cable.
2. **Cable Theft & Tampering Detection:** Hardware continuity loop and strain sensors. Unauthorized disconnects trigger an audible alarm, red beacon flash, and remote dashboard notification.
3. **Internal Temperature Monitoring:** Dual NTC thermistors track power contactor heat; features Normal (&lt;45°C), Warning (45–65°C), and Critical (&gt;65°C) automatic cutoff.
4. **Automatic 6-Fault Electrical Detection:** Real-time hardware trip simulations for Overcurrent, Overvoltage, Undervoltage, Short Circuit, Earth Leakage (RCD 30mA), and Thermal Breaker with physical contactor isolation.
5. **Water & Dust Protection (IP65 Design Target):** Silicone rubber gaskets, sloped rain canopy, sealed touchscreen frame, and downward cable outlet. Includes interactive 3D Rain and Dust storm particle simulations.
6. **Real-Time Charging Status Display:** 3D touchscreen synced 1:1 with application state displaying battery %, 230V AC, 16A, 3.6 kW, elapsed time, and security state.
7. **Remote Maintenance Alerts:** Cloud operator dashboard displaying station online state, charging metrics, and interactive maintenance event logs with Acknowledge/Clear actions.

### 3. Exploded 3D Engineering View
Smoothly separates 8 modular components with 3D guide rays and technical specification cards:
1. Top Weather-Shielding Canopy
2. Multi-Color Status LED Lighting Module
3. Interactive IP65 Digital Touchscreen
4. Automatic Cable Retraction Housing
5. Multi-Sensor & Anti-Theft Node
6. Electrical Protection & Safe Isolation Bay
7. Weatherproof Heavy-Gauge Enclosure
8. Base Mounting Unit & Ground Foundation

### 4. Interactive 3D Viewer & Camera Controls
- OrbitControls (Drag to rotate, scroll to zoom, right-drag to pan).
- Preset Camera Views: Hero View, Front, Rear, Left, Right, Top, Touchscreen Closeup, Scooter Closeup, and Cable Reel Closeup.
- Component Raycasting: Click any 3D component on the station or scooter to inspect its name, purpose, and engineering specifications.
- Day Mode / Night Mode toggle with cinematic lighting and glowing neon accents.
- Weather System toggle (Clear, Rain Jet, Dust Storm).

### 5. 5-Step Animated Workflow
Interactive walkthrough showing:
- **Step 1:** Park and Connect
- **Step 2:** Start Charging
- **Step 3:** Monitor & 7-in-1 Protection
- **Step 4:** Receive Telemetry Alerts
- **Step 5:** Safe Return & Auto-Retract

### 6. Live Charging Simulation Test Bench
- Full operational control over vehicle connection, cable extension, charging start/pause/resume/stop, and cable retraction.
- Real-time calculations of kWh delivered, estimated battery range added (+km), and live V/A/kW metrics.

### 7. Remote IoT Operator Dashboard
- 6 Live KPI telemetry cards.
- 3 Responsive Chart.js telemetry charts:
  - Internal Temperature Profile (°C) vs Time.
  - Charging Output Power (kW) vs Time.
  - Scooter Battery Curve (%) vs Time.
- Real-time Alerts feed with sample event drills (Tamper, Overheat, Electrical Fault, Maintenance Due).

---

## 🛠️ Technology Stack

- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+ Modules)
- **3D Graphics:** [Three.js](https://threejs.org/) (r187) with `OrbitControls`
- **Animations:** [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform)
- **Data Visualization:** [Chart.js](https://www.chartjs.org/)
- **Audio Feedback:** Web Audio API procedural synthesizer
- **Tooling & Build:** [Vite](https://vitejs.dev/)

---

## 💻 Running the Application Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the full 3D demonstration.

### 3. Production Build
```bash
npm run build
```
Generates an optimized, production-ready bundle in the `dist/` directory.

---

## 📋 Proposed Technical Specifications (Summary)

| Parameter | Proposed Design Configuration |
|---|---|
| **Input Power** | 230V AC ±10%, 50/60 Hz Single Phase |
| **Output Rating** | 16A Continuous (3.68 kW Nominal Power) |
| **Enclosure Rating Target** | IP65 (Dust-tight and protected against water jets) |
| **Impact Resistance** | IK10 Vandal-Resistant Enclosure |
| **Microcontroller** | Dual-Core ESP32 240 MHz with RTOS |
| **Connectivity** | 4G LTE-M / Wi-Fi 802.11 b/g/n / Bluetooth 5.0 LE |
| **Cable System** | 5.0m Motorized Retraction Drum (H07RN-F 3G2.5 + 2x0.75 mm²) |
| **User Interface** | 10.1" 1000-nit Sunlight-Readable TFT LCD |
| **Target Vehicles** | Electric Two-Wheelers (Scooters, Motorcycles, Mopeds) |

*Disclaimer: All electrical ratings, values, and fault responses are simulated in software for prototype evaluation.*

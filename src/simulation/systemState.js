import { eventBus } from './eventBus.js';

export class SystemState {
  constructor() {
    this.status = 'CONNECTED'; // IDLE, CONNECTED, CHARGING, PAUSED, COMPLETED, FAULT DETECTED, THEFT ALERT
    this.batteryPercent = 78.0;
    this.initialBattery = 78.0;
    this.voltage = 230.0;
    this.current = 0.0;
    this.power = 0.0;
    this.temperature = 34.2;
    this.tempState = 'NORMAL'; // NORMAL, WARNING, CRITICAL
    this.cableState = 'CONNECTED'; // RETRACTED, EXTENDED, CONNECTED
    this.theftAlarm = false;
    this.activeFault = null;
    this.isolationRelay = 'CLOSED'; // CLOSED (normal) or OPEN (isolated)
    this.weather = 'CLEAR'; // CLEAR, RAIN, DUST
    this.mode = 'NIGHT'; // NIGHT, DAY
    this.soundMuted = false;
    this.exploded = false;
    this.chargingDuration = 0; // seconds
    this.energyDelivered = 2.45; // kWh delivered so far
    this.rangeAdded = 18.5; // km
    this.scooterPresent = true;
    this.selectedComponent = null;

    this.alerts = [
      {
        id: 'alt-001',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'INFO',
        title: 'Station Boot Complete',
        message: 'ESP32 controller initialized. All 7 protection subsystems verified.',
        acknowledged: true
      },
      {
        id: 'alt-002',
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'INFO',
        title: 'Scooter Docked',
        message: 'Electric Two-Wheeler detected in bay. Pilot handshaking ready.',
        acknowledged: true
      }
    ];

    this.chargingTimer = null;
  }

  // Cable Controls
  extendCable() {
    if (this.theftAlarm || this.activeFault) return false;
    if (this.cableState === 'RETRACTED') {
      this.cableState = 'EXTENDED';
      this.notify('cable:extended');
      return true;
    }
    return false;
  }

  retractCable() {
    if (this.status === 'CHARGING') {
      this.stopCharging();
    }
    this.cableState = 'RETRACTED';
    this.status = 'IDLE';
    this.current = 0;
    this.power = 0;
    this.notify('cable:retracted');
    return true;
  }

  connectScooter() {
    if (this.theftAlarm || this.activeFault) return false;
    this.scooterPresent = true;
    this.cableState = 'CONNECTED';
    this.status = 'CONNECTED';
    this.notify('scooter:connected');
    this.addAlert('INFO', 'Vehicle Handshake Established', 'EV Scooter plugged in. Ready for charging sequence.');
    return true;
  }

  disconnectScooter() {
    if (this.status === 'CHARGING') {
      this.stopCharging();
    }
    this.cableState = 'EXTENDED';
    this.status = 'IDLE';
    this.current = 0;
    this.power = 0;
    this.notify('scooter:disconnected');
    this.addAlert('INFO', 'Vehicle Disconnected', 'Charging cable unplugged from scooter.');
    return true;
  }

  // Charging Session Controls
  startCharging() {
    if (this.theftAlarm) {
      this.addAlert('WARNING', 'Start Aborted', 'Cannot charge while cable security alarm is active.');
      return false;
    }
    if (this.activeFault) {
      this.addAlert('DANGER', 'Start Aborted', 'Electrical fault active. Clear fault before charging.');
      return false;
    }
    if (this.tempState === 'CRITICAL') {
      this.addAlert('DANGER', 'Start Aborted', 'Internal temperature is critical. Charging blocked.');
      return false;
    }
    if (this.cableState !== 'CONNECTED') {
      this.addAlert('WARNING', 'Cable Not Connected', 'Please connect the cable to the scooter first.');
      return false;
    }

    this.status = 'CHARGING';
    this.current = 16.0;
    this.voltage = 230.0 + (Math.random() * 2 - 1);
    this.power = +( (this.voltage * this.current) / 1000 ).toFixed(2);
    this.isolationRelay = 'CLOSED';

    this.notify('charging:started');
    this.addAlert('INFO', 'Charging Initiated', `Nominal 3.6 kW session started at 230V / 16A.`);
    return true;
  }

  pauseCharging() {
    if (this.status !== 'CHARGING') return false;
    this.status = 'PAUSED';
    this.current = 0.0;
    this.power = 0.0;
    this.notify('charging:paused');
    this.addAlert('WARNING', 'Charging Paused', 'Session paused by operator or thermal threshold.');
    return true;
  }

  resumeCharging() {
    if (this.status !== 'PAUSED') return false;
    return this.startCharging();
  }

  stopCharging() {
    if (this.status === 'IDLE' || this.status === 'COMPLETED') return;
    this.status = this.batteryPercent >= 100 ? 'COMPLETED' : 'CONNECTED';
    this.current = 0.0;
    this.power = 0.0;
    this.notify('charging:stopped');
    this.addAlert('INFO', 'Charging Halted', 'Session terminated safely. Relays open.');
  }

  // Update loop for charging increments
  tick(dt = 0.1) {
    if (this.status === 'CHARGING') {
      this.chargingDuration += dt;
      // Add slight realistic jitter
      this.voltage = +( 230.0 + Math.sin(Date.now() * 0.003) * 1.8 ).toFixed(1);
      this.current = +( 16.0 + Math.cos(Date.now() * 0.002) * 0.2 ).toFixed(1);
      this.power = +( (this.voltage * this.current) / 1000 ).toFixed(2);

      // Energy accumulation
      const energyAdd = (this.power * (dt / 3600)); // kWh
      this.energyDelivered = +(this.energyDelivered + energyAdd).toFixed(3);
      this.rangeAdded = +(this.rangeAdded + energyAdd * 8.5).toFixed(1); // approx 8.5 km per kWh for e-scooter

      // Battery percentage increase (e.g., 1% every 3 seconds for active visual feedback)
      if (this.batteryPercent < 100) {
        this.batteryPercent = Math.min(100, +(this.batteryPercent + (dt * 0.35)).toFixed(1));
      } else {
        this.batteryPercent = 100.0;
        this.status = 'COMPLETED';
        this.current = 0.0;
        this.power = 0.0;
        this.notify('charging:completed');
        this.addAlert('INFO', 'Battery Fully Charged', '100% capacity reached. Automatic trickle-off active.');
      }

      // Slight thermal warming during charging
      if (this.temperature < 48 && this.tempState !== 'CRITICAL') {
        this.temperature = +(this.temperature + dt * 0.05).toFixed(1);
        this.updateTempState();
      }

      this.notify('state:updated');
    }
  }

  // Feature 2: Cable Theft Simulation
  simulateCableTheft() {
    this.theftAlarm = true;
    this.status = 'THEFT ALERT';
    this.current = 0;
    this.power = 0;
    this.isolationRelay = 'OPEN';
    this.notify('theft:alarm');
    this.addAlert('DANGER', 'SECURITY ALERT: Cable Tampering', 'Physical strain / unauthorized disconnection detected on cable locking latch! Alarm activated.');
  }

  disarmTheft() {
    this.theftAlarm = false;
    this.status = this.cableState === 'CONNECTED' ? 'CONNECTED' : 'IDLE';
    this.isolationRelay = 'CLOSED';
    this.notify('theft:disarmed');
    this.addAlert('INFO', 'Security Disarmed', 'Cable security status restored to SECURE.');
  }

  // Feature 3: Temperature Monitoring
  setTemperature(newTemp) {
    this.temperature = +Number(newTemp).toFixed(1);
    this.updateTempState();
    this.notify('temperature:changed', this.temperature);
  }

  updateTempState() {
    const prev = this.tempState;
    if (this.temperature >= 68) {
      this.tempState = 'CRITICAL';
      if (this.status === 'CHARGING') {
        this.pauseCharging();
        this.addAlert('DANGER', 'CRITICAL OVER-TEMPERATURE', `Internal temperature reached ${this.temperature}°C! Emergency thermal cutoff triggered.`);
      }
    } else if (this.temperature >= 48) {
      this.tempState = 'WARNING';
      if (prev !== 'WARNING') {
        this.addAlert('WARNING', 'Elevated Temperature Warning', `Internal temperature reached ${this.temperature}°C. Active cooling fan spinning at 100%.`);
      }
    } else {
      this.tempState = 'NORMAL';
    }
  }

  // Feature 4: Fault Detection
  triggerFault(faultKey) {
    const faultDefs = {
      overcurrent: { code: 'FAULT-OC', name: 'Overcurrent Trip (24.2A)', desc: 'Current exceeded 20A safety threshold.' },
      overvoltage: { code: 'FAULT-OV', name: 'Overvoltage Surge (272V)', desc: 'AC grid voltage surge detected.' },
      undervoltage: { code: 'FAULT-UV', name: 'Undervoltage Drop (174V)', desc: 'Grid brownout detected below 190V.' },
      shortcircuit: { code: 'FAULT-SC', name: 'Short Circuit Grounding', desc: 'Dead short impedance detected on output pins.' },
      leakage: { code: 'FAULT-RCD', name: 'Residual Leakage Trip (35mA)', desc: 'Residual Current Device (RCD) detected earth leakage.' },
      abnormaltemp: { code: 'FAULT-TH', name: 'Thermal Runaway Cutoff', desc: 'PCB heat exchanger thermal breaker triggered.' }
    };

    const fault = faultDefs[faultKey] || { code: 'FAULT-GEN', name: 'General Electrical Anomaly', desc: 'Safe isolation tripped.' };
    this.activeFault = fault;
    this.status = 'FAULT DETECTED';
    this.current = 0;
    this.power = 0;
    this.isolationRelay = 'OPEN'; // Safe isolation status

    this.notify('fault:detected', fault);
    this.addAlert('DANGER', `ELECTRICAL FAULT: ${fault.name}`, `${fault.desc} Main relays physically isolated for operator safety.`);
  }

  clearFault() {
    if (!this.activeFault) return;
    const oldFault = this.activeFault;
    this.activeFault = null;
    this.isolationRelay = 'CLOSED';
    this.status = this.cableState === 'CONNECTED' ? 'CONNECTED' : 'IDLE';
    this.notify('fault:cleared');
    this.addAlert('INFO', 'Fault Reset Verified', `Relays re-engaged after clear of ${oldFault.code}. System healthy.`);
  }

  // Feature 5: Weather
  setWeather(w) {
    this.weather = w;
    this.notify('weather:changed', w);
    this.addAlert('INFO', 'Weather Condition', `Environment set to ${w}. Enclosure IP65 seal active.`);
  }

  // Visual & Audio Toggles
  toggleMode() {
    this.mode = this.mode === 'NIGHT' ? 'DAY' : 'NIGHT';
    this.notify('mode:changed', this.mode);
    return this.mode;
  }

  toggleSound() {
    this.soundMuted = !this.soundMuted;
    this.notify('sound:toggled', this.soundMuted);
    return this.soundMuted;
  }

  // Exploded View
  setExploded(val) {
    this.exploded = !!val;
    this.notify('exploded:changed', this.exploded);
  }

  selectComponent(comp) {
    this.selectedComponent = comp;
    this.notify('component:selected', comp);
  }

  // Alerts Management
  addAlert(severity, title, message) {
    const alert = {
      id: 'alt-' + Math.random().toString(36).substr(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity, // INFO, WARNING, DANGER
      title,
      message,
      acknowledged: false
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > 25) this.alerts.pop();
    this.notify('alert:new', alert);
  }

  acknowledgeAlert(id) {
    const al = this.alerts.find(a => a.id === id);
    if (al) {
      al.acknowledged = true;
      this.notify('alert:acknowledged', id);
    }
  }

  clearAlert(id) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.notify('alert:cleared', id);
  }

  clearAllAlerts() {
    this.alerts = [];
    this.notify('alerts:cleared_all');
  }

  notify(event, data) {
    eventBus.emit(event, data || this);
    eventBus.emit('state:any', this);
  }
}

export const systemState = new SystemState();

import { systemState } from '../simulation/systemState.js';
import { audioService } from '../simulation/audioService.js';
import { eventBus } from '../simulation/eventBus.js';

export class ProtectionFeaturesManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.initControls();
    this.bindDOM();
  }

  initControls() {
    // Feature 1: Cable Retraction Controls
    window.SmartGuardApp = window.SmartGuardApp || {};

    window.SmartGuardApp.extendCable = () => {
      audioService.playClick();
      if (systemState.extendCable()) {
        audioService.playRetract();
      }
    };

    window.SmartGuardApp.retractCable = () => {
      audioService.playClick();
      if (systemState.retractCable()) {
        audioService.playRetract();
      }
    };

    // Feature 2: Cable Theft Simulation
    window.SmartGuardApp.simulateCableTheft = () => {
      audioService.playAlarm();
      systemState.simulateCableTheft();
    };

    window.SmartGuardApp.disarmTheft = () => {
      audioService.playClick();
      systemState.disarmTheft();
      audioService.playSuccess();
    };

    // Feature 3: Temperature Slider
    window.SmartGuardApp.onTempSliderChange = (val) => {
      systemState.setTemperature(val);
      if (systemState.tempState === 'CRITICAL') {
        audioService.playAlarm();
      } else if (systemState.tempState === 'WARNING') {
        audioService.playWarning();
      }
    };

    // Feature 4: Fault Detection Triggers
    window.SmartGuardApp.triggerFault = (faultType) => {
      audioService.playWarning();
      systemState.triggerFault(faultType);
    };

    window.SmartGuardApp.clearFault = () => {
      audioService.playClick();
      systemState.clearFault();
      audioService.playSuccess();
    };

    // Feature 5: Weather Simulation
    window.SmartGuardApp.setWeather = (w) => {
      audioService.playClick();
      systemState.setWeather(w);
    };

    // Feature 6: Charging Simulation
    window.SmartGuardApp.connectScooter = () => {
      audioService.playClick();
      systemState.connectScooter();
    };

    window.SmartGuardApp.disconnectScooter = () => {
      audioService.playClick();
      systemState.disconnectScooter();
    };

    window.SmartGuardApp.startCharging = () => {
      audioService.playClick();
      if (systemState.startCharging()) {
        audioService.playChargingStart();
      }
    };

    window.SmartGuardApp.pauseCharging = () => {
      audioService.playClick();
      systemState.pauseCharging();
    };

    window.SmartGuardApp.resumeCharging = () => {
      audioService.playClick();
      if (systemState.resumeCharging()) {
        audioService.playChargingStart();
      }
    };

    window.SmartGuardApp.stopCharging = () => {
      audioService.playClick();
      systemState.stopCharging();
    };

    // Feature 7: Maintenance Alerts
    window.SmartGuardApp.acknowledgeAlert = (id) => {
      audioService.playClick();
      systemState.acknowledgeAlert(id);
    };

    window.SmartGuardApp.clearAlert = (id) => {
      audioService.playClick();
      systemState.clearAlert(id);
    };

    window.SmartGuardApp.clearAllAlerts = () => {
      audioService.playClick();
      systemState.clearAllAlerts();
    };

    window.SmartGuardApp.simulateSampleAlert = (type) => {
      audioService.playClick();
      switch (type) {
        case 'tamper':
          systemState.simulateCableTheft();
          break;
        case 'high_temp':
          systemState.setTemperature(74.5);
          break;
        case 'fault':
          systemState.triggerFault('overcurrent');
          break;
        case 'complete':
          systemState.batteryPercent = 100;
          systemState.stopCharging();
          systemState.addAlert('INFO', 'Scheduled Session Finished', 'Vehicle target 100% capacity reached.');
          break;
        case 'maintenance':
          systemState.addAlert('WARNING', 'Filter Maintenance Reminder', 'Air intake filtration reached 500 operating hours. Inspect seals.');
          break;
        case 'disconnect':
          systemState.addAlert('DANGER', 'Grid Voltage Unstable', 'Phase A dropped below 180V for >200ms. Grid transient recorded.');
          break;
      }
    };

    // Exploded View Controls
    window.SmartGuardApp.explodeView = () => {
      audioService.playClick();
      systemState.setExploded(true);
    };

    window.SmartGuardApp.assembleView = () => {
      audioService.playClick();
      systemState.setExploded(false);
    };

    window.SmartGuardApp.resetExplodedView = () => {
      audioService.playClick();
      systemState.setExploded(false);
      if (this.sceneManager && this.sceneManager.cameraManager) {
        this.sceneManager.cameraManager.reset();
      }
    };

    // Camera Presets
    window.SmartGuardApp.setCameraPreset = (preset) => {
      audioService.playClick();
      if (this.sceneManager && this.sceneManager.cameraManager) {
        this.sceneManager.cameraManager.setPreset(preset);
      }
    };

    // Mode & Audio Toggles
    window.SmartGuardApp.toggleMode = () => {
      audioService.playClick();
      const newMode = systemState.toggleMode();
      const btn = document.getElementById('btn-mode-toggle');
      if (btn) {
        btn.innerHTML = newMode === 'NIGHT' ? '🌙 Night Mode' : '☀️ Day Mode';
      }
    };

    window.SmartGuardApp.toggleSound = () => {
      const isMuted = systemState.toggleSound();
      const btn = document.getElementById('btn-sound-toggle');
      if (btn) {
        btn.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound On';
      }
    };
  }

  bindDOM() {
    eventBus.on('state:any', () => {
      this.updateFeatureDOM();
    });

    // Temperature slider sync
    const slider = document.getElementById('sim-temp-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const display = document.getElementById('sim-temp-display');
        if (display) display.textContent = `${val.toFixed(1)}°C`;
        window.SmartGuardApp.onTempSliderChange(val);
      });
    }
  }

  updateFeatureDOM() {
    const s = systemState;

    // Feature 1: Cable status pill
    const elCableState = document.getElementById('feat-cable-state');
    if (elCableState) {
      elCableState.textContent = s.cableState;
      elCableState.className = `status-pill ${s.cableState === 'CONNECTED' ? 'success' : s.cableState === 'EXTENDED' ? 'warning' : 'active'}`;
    }

    // Feature 2: Theft Security status pill & banner
    const elTheftState = document.getElementById('feat-theft-state');
    const elTheftBanner = document.getElementById('theft-alarm-banner');
    if (elTheftState) {
      if (s.theftAlarm) {
        elTheftState.textContent = 'ALERT: TAMPER DETECTED';
        elTheftState.className = 'status-pill danger pulse-danger';
      } else {
        elTheftState.textContent = 'SECURE (MAGNETIC LOCK ENGAGED)';
        elTheftState.className = 'status-pill success';
      }
    }
    if (elTheftBanner) {
      elTheftBanner.style.display = s.theftAlarm ? 'flex' : 'none';
    }

    // Feature 3: Temperature indicator
    const elTempDisplay = document.getElementById('sim-temp-display');
    const elTempSlider = document.getElementById('sim-temp-slider');
    const elTempBadge = document.getElementById('feat-temp-badge');
    if (elTempDisplay && elTempSlider && document.activeElement !== elTempSlider) {
      elTempDisplay.textContent = `${s.temperature.toFixed(1)}°C`;
      elTempSlider.value = s.temperature;
    }
    if (elTempBadge) {
      elTempBadge.textContent = s.tempState;
      elTempBadge.className = `status-pill ${s.tempState === 'CRITICAL' ? 'danger' : s.tempState === 'WARNING' ? 'warning' : 'success'}`;
    }

    // Feature 4: Fault Indicator
    const elFaultBadge = document.getElementById('feat-fault-badge');
    const elRelayBadge = document.getElementById('feat-relay-badge');
    if (elFaultBadge) {
      if (s.activeFault) {
        elFaultBadge.textContent = `FAULT: ${s.activeFault.name}`;
        elFaultBadge.className = 'status-pill danger';
      } else {
        elFaultBadge.textContent = 'NO FAULTS (ALL SYSTEMS NOMINAL)';
        elFaultBadge.className = 'status-pill success';
      }
    }
    if (elRelayBadge) {
      elRelayBadge.textContent = s.isolationRelay === 'CLOSED' ? 'CLOSED (ACTIVE)' : 'ISOLATED (SAFE CUTOFF)';
      elRelayBadge.className = `status-pill ${s.isolationRelay === 'CLOSED' ? 'success' : 'danger'}`;
    }

    // Feature 5: Weather buttons
    ['CLEAR', 'RAIN', 'DUST'].forEach(w => {
      const btn = document.getElementById(`btn-weather-${w.toLowerCase()}`);
      if (btn) {
        if (s.weather === w) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    // Feature 6: Simulation controls sync
    const btnConnect = document.getElementById('btn-sim-connect');
    const btnDisconnect = document.getElementById('btn-sim-disconnect');
    const btnExtend = document.getElementById('btn-sim-extend');
    const btnRetract = document.getElementById('btn-sim-retract');
    const btnStart = document.getElementById('btn-sim-start');
    const btnPause = document.getElementById('btn-sim-pause');
    const btnResume = document.getElementById('btn-sim-resume');
    const btnStop = document.getElementById('btn-sim-stop');

    if (btnConnect) btnConnect.disabled = s.cableState === 'CONNECTED';
    if (btnDisconnect) btnDisconnect.disabled = s.cableState !== 'CONNECTED';
    if (btnExtend) btnExtend.disabled = s.cableState !== 'RETRACTED';
    if (btnRetract) btnRetract.disabled = s.cableState === 'RETRACTED' || s.status === 'CHARGING';
    if (btnStart) btnStart.disabled = s.status === 'CHARGING' || s.cableState !== 'CONNECTED' || s.theftAlarm || !!s.activeFault;
    if (btnPause) btnPause.disabled = s.status !== 'CHARGING';
    if (btnResume) btnResume.disabled = s.status !== 'PAUSED';
    if (btnStop) btnStop.disabled = s.status !== 'CHARGING' && s.status !== 'PAUSED';
  }
}

import { systemState } from '../simulation/systemState.js';
import { eventBus } from '../simulation/eventBus.js';
import { DashboardCharts } from './charts.js';

export class DashboardController {
  constructor() {
    this.charts = new DashboardCharts();

    this.chartTimer = setInterval(() => {
      this.charts.pushDataPoint();
      this.updateTelemetryDOM();
    }, 2000);

    this.bindEvents();
    this.updateTelemetryDOM();
    this.renderAlerts();
  }

  bindEvents() {
    eventBus.on('state:any', () => {
      this.updateTelemetryDOM();
      this.renderAlerts();
    });

    eventBus.on('alert:new', () => {
      this.renderAlerts();
    });
  }

  updateTelemetryDOM() {
    const s = systemState;

    // Station Status KPI
    const elStationStatus = document.getElementById('dash-station-status');
    if (elStationStatus) {
      if (s.theftAlarm) {
        elStationStatus.innerHTML = '<span class="status-pill danger">SECURITY ALERT</span>';
      } else if (s.activeFault) {
        elStationStatus.innerHTML = '<span class="status-pill danger">FAULT ISOLATED</span>';
      } else {
        elStationStatus.innerHTML = '<span class="status-pill active">ONLINE (ESP32 IoT)</span>';
      }
    }

    // Charging Status KPI
    const elChargeStatus = document.getElementById('dash-charge-status');
    if (elChargeStatus) {
      elChargeStatus.textContent = s.status;
      elChargeStatus.className = `kpi-val ${s.status === 'CHARGING' ? 'text-neon' : s.theftAlarm || s.activeFault ? 'text-danger' : 'text-cyan'}`;
    }

    // Power & Metrics
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('dash-power-val', `${s.power.toFixed(2)} kW`);
    setTxt('dash-voltage-val', `${s.voltage.toFixed(0)} V`);
    setTxt('dash-current-val', `${s.current.toFixed(1)} A`);
    setTxt('dash-battery-val', `${s.batteryPercent.toFixed(0)}%`);
    setTxt('dash-energy-val', `${s.energyDelivered.toFixed(2)} kWh`);
    setTxt('dash-range-val', `+${s.rangeAdded.toFixed(0)} km`);

    // Temperature KPI
    const elTemp = document.getElementById('dash-temp-val');
    const elTempBadge = document.getElementById('dash-temp-badge');
    if (elTemp) {
      elTemp.textContent = `${s.temperature.toFixed(1)} °C`;
      elTemp.className = `kpi-val ${s.tempState === 'CRITICAL' ? 'text-danger' : s.tempState === 'WARNING' ? 'text-warning' : 'text-neon'}`;
    }
    if (elTempBadge) {
      elTempBadge.textContent = s.tempState;
      elTempBadge.className = `status-pill ${s.tempState === 'CRITICAL' ? 'danger' : s.tempState === 'WARNING' ? 'warning' : 'success'}`;
    }

    // Cable Security KPI
    const elCableSec = document.getElementById('dash-cable-sec');
    if (elCableSec) {
      if (s.theftAlarm) {
        elCableSec.innerHTML = '<span class="status-pill danger pulse-danger">ALERT: TAMPERING DETECTED</span>';
      } else {
        elCableSec.innerHTML = '<span class="status-pill success">SECURE (MAGNETIC LOCK ENGAGED)</span>';
      }
    }

    // Electrical Protection KPI
    const elFaultKpi = document.getElementById('dash-fault-kpi');
    if (elFaultKpi) {
      if (s.activeFault) {
        elFaultKpi.innerHTML = `<span class="status-pill danger">FAULT: ${s.activeFault.code}</span>`;
      } else {
        elFaultKpi.innerHTML = '<span class="status-pill success">6/6 FAULT SUBSYSTEMS NOMINAL</span>';
      }
    }

    // Safe Isolation Relay KPI
    const elRelay = document.getElementById('dash-relay-val');
    if (elRelay) {
      elRelay.textContent = s.isolationRelay === 'CLOSED' ? 'NORMAL (CLOSED)' : 'ISOLATED (OPEN)';
      elRelay.className = s.isolationRelay === 'CLOSED' ? 'text-neon' : 'text-danger';
    }
  }

  renderAlerts() {
    const listEl = document.getElementById('dash-alerts-feed');
    if (!listEl) return;

    if (systemState.alerts.length === 0) {
      listEl.innerHTML = `<div class="empty-alerts">No active maintenance notifications. All systems operating within proposed specifications.</div>`;
      return;
    }

    listEl.innerHTML = systemState.alerts.map(a => `
      <div class="alert-item severity-${a.severity.toLowerCase()} ${a.acknowledged ? 'acknowledged' : 'unread'}">
        <div class="alert-header">
          <div class="alert-meta">
            <span class="severity-badge ${a.severity.toLowerCase()}">${a.severity}</span>
            <span class="alert-time">${a.timestamp}</span>
            ${a.acknowledged ? '<span class="ack-tag">✓ Acknowledged</span>' : ''}
          </div>
          <div class="alert-actions">
            ${!a.acknowledged ? `<button class="btn-sm btn-outline-cyan" onclick="window.SmartGuardApp.acknowledgeAlert('${a.id}')">Acknowledge</button>` : ''}
            <button class="btn-sm btn-icon-clear" onclick="window.SmartGuardApp.clearAlert('${a.id}')" title="Dismiss">✕</button>
          </div>
        </div>
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.message}</div>
      </div>
    `).join('');

    if (window.refreshLucideIcons) {
      window.refreshLucideIcons();
    }
  }
}

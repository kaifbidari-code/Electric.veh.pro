import * as THREE from 'three';
import { systemState } from '../simulation/systemState.js';

export class ScreenTexture {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 1024;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.animTime = 0;
    this.render();
  }

  update(dt = 0.016) {
    this.animTime += dt;
    this.render();
    this.texture.needsUpdate = true;
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const s = systemState;

    // Background gradient - dark cybernetic
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#040d18');
    bgGrad.addColorStop(0.5, '#02070d');
    bgGrad.addColorStop(1, '#051322');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer cyber border with neon corners
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    // Corner brackets
    const bracketSize = 24;
    ctx.strokeStyle = '#39ff63';
    ctx.lineWidth = 4;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(14, 14 + bracketSize); ctx.lineTo(14, 14); ctx.lineTo(14 + bracketSize, 14);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - 14 - bracketSize, 14); ctx.lineTo(w - 14, 14); ctx.lineTo(w - 14, 14 + bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(14, h - 14 - bracketSize); ctx.lineTo(14, h - 14); ctx.lineTo(14 + bracketSize, h - 14);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - 14 - bracketSize, h - 14); ctx.lineTo(w - 14, h - 14); ctx.lineTo(w - 14, h - 14 - bracketSize);
    ctx.stroke();

    // 1. TOP HEADER
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SMARTGUARD EV', 40, 68);

    // Brand sub-badge
    ctx.fillStyle = '#39ff63';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('STATION #01 • FAST-AC', 40, 92);

    // Connectivity status icon
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00d9ff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('● CONNECTED', w - 40, 72);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.fillText('4G / ESP32-IoT', w - 40, 92);

    // Horizontal separator
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(w - 40, 115);
    ctx.stroke();

    // 2. STATUS BADGE
    let statusColor = '#39ff63';
    let statusBg = 'rgba(57, 255, 99, 0.15)';
    let statusText = s.status;

    if (s.theftAlarm) {
      statusColor = '#ff3030';
      statusBg = Math.sin(this.animTime * 10) > 0 ? 'rgba(255, 48, 48, 0.35)' : 'rgba(255, 48, 48, 0.1)';
      statusText = 'SECURITY ALERT: TAMPER';
    } else if (s.activeFault) {
      statusColor = '#ff3030';
      statusBg = 'rgba(255, 48, 48, 0.25)';
      statusText = `FAULT: ${s.activeFault.code}`;
    } else if (s.tempState === 'CRITICAL') {
      statusColor = '#ff3030';
      statusBg = 'rgba(255, 48, 48, 0.25)';
      statusText = 'OVERHEAT LOCKOUT';
    } else if (s.status === 'CHARGING') {
      statusColor = '#39ff63';
      statusBg = 'rgba(57, 255, 99, 0.2)';
      statusText = 'CHARGING ACTIVE';
    } else if (s.status === 'PAUSED') {
      statusColor = '#ffb020';
      statusBg = 'rgba(255, 176, 32, 0.2)';
      statusText = 'CHARGING PAUSED';
    } else if (s.status === 'COMPLETED') {
      statusColor = '#00d9ff';
      statusBg = 'rgba(0, 217, 255, 0.2)';
      statusText = 'CHARGE COMPLETE (100%)';
    } else if (s.status === 'CONNECTED') {
      statusColor = '#00d9ff';
      statusBg = 'rgba(0, 217, 255, 0.15)';
      statusText = 'READY / PLUGGED IN';
    } else {
      statusColor = '#8fa3b8';
      statusBg = 'rgba(143, 163, 184, 0.1)';
      statusText = 'STANDBY / IDLE';
    }

    // Status pill
    ctx.fillStyle = statusBg;
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 40, 135, w - 80, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(statusText, w / 2, 168);

    // 3. CIRCULAR BATTERY GAUGE
    const cx = w / 2;
    const cy = 340;
    const radius = 110;

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Progress arc
    const progress = Math.min(1, Math.max(0, s.batteryPercent / 100));
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * progress);

    const arcGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    arcGrad.addColorStop(0, '#00d9ff');
    arcGrad.addColorStop(1, '#39ff63');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = s.theftAlarm || s.activeFault ? '#ff3030' : arcGrad;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Inner glowing ring if charging
    if (s.status === 'CHARGING') {
      const pulse = (Math.sin(this.animTime * 4) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(57, 255, 99, ${0.15 + pulse * 0.25})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Center battery text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(`${Math.round(s.batteryPercent)}%`, cx, cy + 18);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px monospace';
    ctx.fillText('BATTERY LEVEL', cx, cy + 46);

    // 4. POWER & ELECTRICAL METRICS (2x2 Grid)
    const cardY = 490;
    const cardW = (w - 100) / 2;
    const cardH = 92;

    const metrics = [
      { label: 'VOLTAGE', val: `${s.voltage.toFixed(0)} V`, color: '#00d9ff', x: 40, y: cardY },
      { label: 'CURRENT', val: `${s.current.toFixed(1)} A`, color: '#39ff63', x: 40 + cardW + 20, y: cardY },
      { label: 'POWER', val: `${s.power.toFixed(2)} kW`, color: '#ffffff', x: 40, y: cardY + cardH + 16 },
      {
        label: 'TEMPERATURE',
        val: `${s.temperature.toFixed(1)} °C`,
        color: s.tempState === 'CRITICAL' ? '#ff3030' : s.tempState === 'WARNING' ? '#ffb020' : '#39ff63',
        sub: s.tempState,
        x: 40 + cardW + 20,
        y: cardY + cardH + 16
      }
    ];

    metrics.forEach(m => {
      ctx.fillStyle = 'rgba(7, 26, 42, 0.8)';
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, m.x, m.y, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px monospace';
      ctx.fillText(m.label, m.x + 14, m.y + 26);

      ctx.fillStyle = m.color;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(m.val, m.x + 14, m.y + 60);

      if (m.sub) {
        ctx.fillStyle = m.color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(m.sub, m.x + 14, m.y + 78);
      }
    });

    // 5. SESSION INFORMATION
    const infoY = 720;
    ctx.fillStyle = 'rgba(7, 26, 42, 0.6)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, 40, infoY, w - 80, 130, 8);
    ctx.fill();
    ctx.stroke();

    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px monospace';
    ctx.fillText('SESSION TIME', 60, infoY + 32);
    ctx.fillText('ENERGY DELIVERED', 220, infoY + 32);
    ctx.fillText('EST. RANGE ADDED', 370, infoY + 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(formatTime(s.chargingDuration), 60, infoY + 62);
    ctx.fillText(`${s.energyDelivered.toFixed(2)} kWh`, 220, infoY + 62);
    ctx.fillText(`+${s.rangeAdded.toFixed(0)} km`, 370, infoY + 62);

    // Protection target tag
    ctx.fillStyle = '#00d9ff';
    ctx.font = '11px monospace';
    ctx.fillText('SAFETY SYSTEM: 7-IN-1 ACTIVE', 60, infoY + 104);

    ctx.textAlign = 'right';
    ctx.fillStyle = s.isolationRelay === 'CLOSED' ? '#39ff63' : '#ff3030';
    ctx.fillText(`RELAY: ${s.isolationRelay}`, w - 60, infoY + 104);

    // 6. BOTTOM PROGRESS BAR
    const barY = 880;
    const barW = w - 80;
    const barH = 14;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.roundRect(ctx, 40, barY, barW, barH, 7);
    ctx.fill();

    const filledW = Math.max(10, barW * progress);
    const barGrad = ctx.createLinearGradient(40, barY, 40 + filledW, barY);
    barGrad.addColorStop(0, '#00d9ff');
    barGrad.addColorStop(1, '#39ff63');
    ctx.fillStyle = barGrad;
    this.roundRect(ctx, 40, barY, filledW, barH, 7);
    ctx.fill();

    // Footer copyright / verification
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '12px monospace';
    ctx.fillText('SMARTGUARD EV • WEATHERPROOF SMART CHARGER • IP65 TARGET', w / 2, 940);
    ctx.fillText('PROPOSED DESIGN DEMONSTRATION • SIMULATED DATA', w / 2, 964);
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

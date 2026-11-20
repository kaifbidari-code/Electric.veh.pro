import { Chart, registerables } from 'chart.js';
import { systemState } from '../simulation/systemState.js';

Chart.register(...registerables);

// Set default global Chart.js cyber styling
Chart.defaults.color = '#8fa3b8';
Chart.defaults.font.family = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
Chart.defaults.borderColor = 'rgba(0, 217, 255, 0.08)';

export class DashboardCharts {
  constructor() {
    this.tempChart = null;
    this.powerChart = null;
    this.batteryChart = null;

    this.maxDataPoints = 16;
    this.timeLabels = [];
    this.tempData = [];
    this.powerData = [];
    this.batteryData = [];

    // Pre-populate with realistic initial history
    const now = Date.now();
    for (let i = this.maxDataPoints - 1; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      this.timeLabels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      this.tempData.push(+(31.0 + Math.random() * 2.5).toFixed(1));
      this.powerData.push(systemState.status === 'CHARGING' ? +(3.6 + Math.random() * 0.15).toFixed(2) : 0);
      this.batteryData.push(Math.max(60, +(systemState.batteryPercent - (i * 0.4)).toFixed(1)));
    }

    this.initCharts();
  }

  initCharts() {
    // 1. Temperature Chart
    const tempCanvas = document.getElementById('chart-temperature');
    if (tempCanvas) {
      this.tempChart = new Chart(tempCanvas, {
        type: 'line',
        data: {
          labels: [...this.timeLabels],
          datasets: [{
            label: 'Internal Temperature (°C)',
            data: [...this.tempData],
            borderColor: '#00d9ff',
            backgroundColor: 'rgba(0, 217, 255, 0.12)',
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: '#00d9ff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#071a2a',
              titleColor: '#00d9ff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(0, 217, 255, 0.3)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              min: 20,
              max: 90,
              grid: { color: 'rgba(0, 217, 255, 0.06)' },
              ticks: { callback: v => `${v}°C` }
            },
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 6 }
            }
          }
        }
      });
    }

    // 2. Charging Power Chart
    const powerCanvas = document.getElementById('chart-power');
    if (powerCanvas) {
      this.powerChart = new Chart(powerCanvas, {
        type: 'line',
        data: {
          labels: [...this.timeLabels],
          datasets: [{
            label: 'Output Power (kW)',
            data: [...this.powerData],
            borderColor: '#39ff63',
            backgroundColor: 'rgba(57, 255, 99, 0.12)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: '#39ff63'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#071a2a',
              titleColor: '#39ff63',
              bodyColor: '#ffffff',
              borderColor: 'rgba(57, 255, 99, 0.3)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              min: 0,
              max: 5,
              grid: { color: 'rgba(57, 255, 99, 0.06)' },
              ticks: { callback: v => `${v} kW` }
            },
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 6 }
            }
          }
        }
      });
    }

    // 3. Battery Progress Chart
    const batteryCanvas = document.getElementById('chart-battery');
    if (batteryCanvas) {
      this.batteryChart = new Chart(batteryCanvas, {
        type: 'line',
        data: {
          labels: [...this.timeLabels],
          datasets: [{
            label: 'Scooter Battery (%)',
            data: [...this.batteryData],
            borderColor: '#bfc8d2',
            backgroundColor: 'rgba(191, 200, 210, 0.1)',
            borderWidth: 2,
            tension: 0.25,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: '#bfc8d2'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#071a2a',
              titleColor: '#bfc8d2',
              bodyColor: '#ffffff',
              borderColor: 'rgba(191, 200, 210, 0.3)',
              borderWidth: 1
            }
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { callback: v => `${v}%` }
            },
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 6 }
            }
          }
        }
      });
    }
  }

  pushDataPoint() {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const s = systemState;

    this.timeLabels.push(timeStr);
    if (this.timeLabels.length > this.maxDataPoints) this.timeLabels.shift();

    this.tempData.push(s.temperature);
    if (this.tempData.length > this.maxDataPoints) this.tempData.shift();

    this.powerData.push(s.power);
    if (this.powerData.length > this.maxDataPoints) this.powerData.shift();

    this.batteryData.push(s.batteryPercent);
    if (this.batteryData.length > this.maxDataPoints) this.batteryData.shift();

    if (this.tempChart) {
      // Color change on temperature threshold
      const tempColor = s.tempState === 'CRITICAL' ? '#ff3030' : s.tempState === 'WARNING' ? '#ffb020' : '#00d9ff';
      this.tempChart.data.labels = [...this.timeLabels];
      this.tempChart.data.datasets[0].data = [...this.tempData];
      this.tempChart.data.datasets[0].borderColor = tempColor;
      this.tempChart.data.datasets[0].pointBackgroundColor = tempColor;
      this.tempChart.update('none');
    }

    if (this.powerChart) {
      this.powerChart.data.labels = [...this.timeLabels];
      this.powerChart.data.datasets[0].data = [...this.powerData];
      this.powerChart.update('none');
    }

    if (this.batteryChart) {
      this.batteryChart.data.labels = [...this.timeLabels];
      this.batteryChart.data.datasets[0].data = [...this.batteryData];
      this.batteryChart.update('none');
    }
  }
}

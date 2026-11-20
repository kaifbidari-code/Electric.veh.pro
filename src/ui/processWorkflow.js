import { systemState } from '../simulation/systemState.js';
import { audioService } from '../simulation/audioService.js';

export class ProcessWorkflow {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.currentStep = 1;
    this.autoPlayTimer = null;
    this.isAutoPlaying = false;

    this.steps = [
      {
        step: 1,
        title: 'Park & Connect Handshake',
        desc: 'Electric scooter enters designated SmartGuard EV parking bay. Ultrasonic sensors detect vehicle presence and prepare charging pilot line.',
        action: () => {
          this.sceneManager.cameraManager.setPreset('scooter');
          systemState.connectScooter();
        }
      },
      {
        step: 2,
        title: 'Extend & Secure Connection',
        desc: 'Internal BLDC motor unlocks the reel. Operator extends flexible cable and inserts plug into scooter charging port. Magnetic lock clicks in place.',
        action: () => {
          this.sceneManager.cameraManager.setPreset('reel');
          systemState.connectScooter();
          setTimeout(() => {
            systemState.startCharging();
          }, 800);
        }
      },
      {
        step: 3,
        title: 'Monitor & 7-in-1 Protection',
        desc: 'All 7 protection features actively monitor: temperature sensors track thermal rise, anti-theft loops guard cable integrity, and safe isolation relays stand guard.',
        action: () => {
          this.sceneManager.cameraManager.setPreset('screen');
        }
      },
      {
        step: 4,
        title: 'Real-time Telemetry & Alerts',
        desc: 'High-speed ESP32 controller streams live V, A, kW, battery %, and temperature data to the remote operator dashboard and cloud telemetry node.',
        action: () => {
          const dashSection = document.getElementById('dashboard');
          if (dashSection) {
            dashSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      },
      {
        step: 5,
        title: 'Safe Return & Auto-Retract',
        desc: 'Upon full charge completion or manual disconnect, isolation relays cut current safely. The cable auto-retracts smoothly back into the sealed reel housing.',
        action: () => {
          this.sceneManager.cameraManager.setPreset('default');
          systemState.stopCharging();
          setTimeout(() => {
            systemState.disconnectScooter();
            setTimeout(() => {
              systemState.retractCable();
            }, 600);
          }, 800);
        }
      }
    ];

    this.bindDOM();
    this.renderStep(1);
  }

  bindDOM() {
    window.SmartGuardApp = window.SmartGuardApp || {};

    window.SmartGuardApp.goToStep = (stepNum) => {
      audioService.playClick();
      this.renderStep(stepNum);
    };

    window.SmartGuardApp.toggleAutoPlayWorkflow = () => {
      audioService.playClick();
      if (this.isAutoPlaying) {
        this.stopAutoPlay();
      } else {
        this.startAutoPlay();
      }
    };
  }

  renderStep(stepNum) {
    this.currentStep = stepNum;
    const stepData = this.steps[stepNum - 1];
    if (!stepData) return;

    // Execute step action
    stepData.action();

    // Update Step items in UI
    for (let i = 1; i <= 5; i++) {
      const stepItem = document.getElementById(`workflow-step-${i}`);
      if (stepItem) {
        if (i === stepNum) {
          stepItem.classList.add('active');
        } else if (i < stepNum) {
          stepItem.classList.remove('active');
          stepItem.classList.add('completed');
        } else {
          stepItem.classList.remove('active', 'completed');
        }
      }
    }

    // Update Details Display
    const titleEl = document.getElementById('workflow-active-title');
    const descEl = document.getElementById('workflow-active-desc');
    const badgeEl = document.getElementById('workflow-active-num');

    if (titleEl) titleEl.textContent = stepData.title;
    if (descEl) descEl.textContent = stepData.desc;
    if (badgeEl) badgeEl.textContent = `STEP 0${stepData.step}`;
  }

  startAutoPlay() {
    this.isAutoPlaying = true;
    const btn = document.getElementById('btn-workflow-autoplay');
    if (btn) btn.innerHTML = '⏸ Pause Walkthrough';

    this.autoPlayTimer = setInterval(() => {
      let next = this.currentStep + 1;
      if (next > 5) next = 1;
      this.renderStep(next);
    }, 4500);
  }

  stopAutoPlay() {
    this.isAutoPlaying = false;
    const btn = document.getElementById('btn-workflow-autoplay');
    if (btn) btn.innerHTML = '▶ Auto-Play Walkthrough';

    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}

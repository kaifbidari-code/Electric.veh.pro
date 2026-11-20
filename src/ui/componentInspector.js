import { eventBus } from '../simulation/eventBus.js';
import { audioService } from '../simulation/audioService.js';

export class ComponentInspector {
  constructor() {
    this.modalEl = document.getElementById('component-modal');
    this.titleEl = document.getElementById('comp-modal-title');
    this.purposeEl = document.getElementById('comp-modal-purpose');
    this.specsEl = document.getElementById('comp-modal-specs');

    this.bindEvents();
  }

  bindEvents() {
    eventBus.on('component:selected', (comp) => {
      this.show(comp);
    });

    window.SmartGuardApp = window.SmartGuardApp || {};
    window.SmartGuardApp.closeComponentModal = () => {
      audioService.playClick();
      this.hide();
    };
  }

  show(comp) {
    if (!comp || !this.modalEl) return;
    audioService.playClick();

    if (this.titleEl) this.titleEl.textContent = comp.name || 'SmartGuard EV Component';
    if (this.purposeEl) this.purposeEl.textContent = comp.purpose || 'Industrial component of the SmartGuard EV station.';
    if (this.specsEl) this.specsEl.textContent = comp.specs || 'High-performance engineering specification.';

    this.modalEl.classList.add('visible');
  }

  hide() {
    if (this.modalEl) {
      this.modalEl.classList.remove('visible');
    }
  }
}

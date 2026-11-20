import './style.css';
import { createIcons, icons } from 'lucide';
import { SceneManager } from './three/sceneManager.js';
import { DashboardController } from './dashboard/dashboard.js';
import { ProtectionFeaturesManager } from './features/protectionFeatures.js';
import { ProcessWorkflow } from './ui/processWorkflow.js';
import { ComponentInspector } from './ui/componentInspector.js';
import { audioService } from './simulation/audioService.js';

// Global icon refresh function
export function refreshLucideIcons() {
  try {
    createIcons({ icons });
  } catch (e) {
    console.warn('Lucide icon render error:', e);
  }
}
window.refreshLucideIcons = refreshLucideIcons;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Lucide icons render
  refreshLucideIcons();

  // 2. Audio unlock on first user gesture
  const unlockAudio = () => {
    audioService.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // 3. Initialize 3D Scene Manager
  const canvasContainer = document.getElementById('canvas-container');
  let sceneManager = null;
  if (canvasContainer) {
    sceneManager = new SceneManager(canvasContainer);
  }

  // 4. Initialize Dashboard Controller & Chart.js
  const dashboard = new DashboardController();

  // 5. Initialize 7-in-1 Protection Features & Interactive Controls
  const protectionFeatures = new ProtectionFeaturesManager(sceneManager);

  // 6. Initialize 5-Step Process Workflow
  const processWorkflow = new ProcessWorkflow(sceneManager);

  // 7. Initialize Component Inspector
  const componentInspector = new ComponentInspector();

  // 8. Synchronize 3D Toolbar button active states
  const tbButtons = document.querySelectorAll('.viewer-toolbar .tb-btn');
  tbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // If inside a preset group
      if (btn.parentElement.children[0].textContent.includes('View') || btn.parentElement.children[0].textContent.includes('Hero')) {
        btn.parentElement.querySelectorAll('.tb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Re-run icons render after all modules mount
  setTimeout(refreshLucideIcons, 100);

  console.log('SmartGuard EV 3D Interactive Demonstration Initialized Successfully.');
});

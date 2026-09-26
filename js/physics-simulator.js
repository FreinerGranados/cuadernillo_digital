/**
 * PHYSICS SIMULATOR & OSCILLOGRAPH ENGINE
 * Laboratorio interactivo en tiempo real con masa-resorte, péndulo simple,
 * vectores dinámicos (velocidad, aceleración, fuerza), espacio de fases,
 * osciloscopio en vivo y balance de energías cinética/potencial.
 * 
 * Desarrollado por el Equipo Multidisciplinar de IA
 */

class PhysicsLab {
  constructor() {
    this.stageCanvas = document.getElementById('sim-stage-canvas');
    this.phaseCanvas = document.getElementById('sim-phase-canvas');
    this.oscCanvas = document.getElementById('sim-osc-canvas');

    if (!this.stageCanvas) return;

    this.stageCtx = this.stageCanvas.getContext('2d');
    this.phaseCtx = this.phaseCanvas ? this.phaseCanvas.getContext('2d') : null;
    this.oscCtx = this.oscCanvas ? this.oscCanvas.getContext('2d') : null;

    // Simulation Parameters
    this.mode = 'spring'; // 'spring' or 'pendulum'
    this.m = 1.0;         // Masa (kg)
    this.k = 25.0;        // Constante del resorte (N/m)
    this.A = 1.5;         // Amplitud inicial (m)
    this.L = 2.0;         // Longitud del péndulo (m)
    this.g = 9.81;        // Gravedad (m/s^2)
    
    // Derived values
    this.updateFrequencies();

    // Dynamical state
    this.t = 0;
    this.isRunning = true;
    this.playbackSpeed = 1.0;
    this.lastTimestamp = 0;

    // Oscilloscope historical rolling buffer
    this.waveHistory = [];
    this.maxHistory = 350;

    this.initCanvases();
    this.bindEvents();
    this.startLoop();
  }

  updateFrequencies() {
    if (this.mode === 'spring') {
      this.omega = Math.sqrt(this.k / this.m);
    } else {
      this.omega = Math.sqrt(this.g / this.L);
    }
    this.T = (2 * Math.PI) / this.omega;
    this.f = 1 / this.T;
  }

  initCanvases() {
    const dpr = window.devicePixelRatio || 1;

    // 1. Stage Canvas
    const sRect = this.stageCanvas.parentElement.getBoundingClientRect();
    this.stageWidth = sRect.width || 420;
    this.stageHeight = sRect.height || 250;
    this.stageCanvas.width = this.stageWidth * dpr;
    this.stageCanvas.height = this.stageHeight * dpr;
    this.stageCtx.scale(dpr, dpr);

    // 2. Phase Space Canvas
    if (this.phaseCanvas) {
      const pRect = this.phaseCanvas.parentElement.getBoundingClientRect();
      this.phaseWidth = pRect.width || 200;
      this.phaseHeight = pRect.height || 100;
      this.phaseCanvas.width = this.phaseWidth * dpr;
      this.phaseCanvas.height = this.phaseHeight * dpr;
      this.phaseCtx.scale(dpr, dpr);
    }

    // 3. Oscilloscope Canvas
    if (this.oscCanvas) {
      const oRect = this.oscCanvas.parentElement.getBoundingClientRect();
      this.oscWidth = oRect.width || 680;
      this.oscHeight = oRect.height || 180;
      this.oscCanvas.width = this.oscWidth * dpr;
      this.oscCanvas.height = this.oscHeight * dpr;
      this.oscCtx.scale(dpr, dpr);
    }
  }

  startLoop() {
    const loop = (timestamp) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
      this.lastTimestamp = timestamp;

      if (this.isRunning) {
        this.t += dt * this.playbackSpeed;
      }

      this.stepPhysics();
      this.renderStage();
      this.renderPhaseSpace();
      this.renderOscilloscope();
      this.updateEnergyMeters();
      this.updateReadoutPills();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stepPhysics() {
    // Exact analytical evaluation of Simple Harmonic Motion
    // x(t) = A * cos(omega * t)
    this.x = this.A * Math.cos(this.omega * this.t);
    // v(t) = -A * omega * sin(omega * t)
    this.v = -this.A * this.omega * Math.sin(this.omega * this.t);
    // a(t) = -omega^2 * x(t)
    this.a = -this.omega * this.omega * this.x;
    // F_rest = -k * x
    this.F = -this.k * this.x;

    // Mechanical Energies
    this.Ek = 0.5 * this.m * this.v * this.v;
    this.Ep = 0.5 * this.k * this.x * this.x;
    this.Etotal = this.Ek + this.Ep;

    // Buffer for oscilloscope
    if (this.isRunning) {
      this.waveHistory.push({
        t: this.t,
        x: this.x,
        v: this.v / this.omega, // Normalized velocity for visual clarity
        a: this.a / (this.omega * this.omega) // Normalized acceleration
      });
      if (this.waveHistory.length > this.maxHistory) {
        this.waveHistory.shift();
      }
    }
  }

  renderStage() {
    const ctx = this.stageCtx;
    const w = this.stageWidth;
    const h = this.stageHeight;

    ctx.clearRect(0, 0, w, h);

    if (this.mode === 'spring') {
      this.drawSpringSystem(ctx, w, h);
    } else {
      this.drawPendulumSystem(ctx, w, h);
    }
  }

  drawSpringSystem(ctx, w, h) {
    const centerY = h * 0.58;
    const wallX = 50;
    const eqX = w * 0.55;
    const pxScale = 65; // pixels per meter
    const massX = eqX + this.x * pxScale;
    const massSize = 46;

    // 1. Draw Surface & Support Wall
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(wallX - 14, centerY - 60, 14, 90);
    // Wall hatch lines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    for (let y = centerY - 55; y < centerY + 30; y += 8) {
      ctx.beginPath();
      ctx.moveTo(wallX - 14, y);
      ctx.lineTo(wallX, y + 8);
      ctx.stroke();
    }

    // Floor
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(wallX, centerY + massSize / 2, w - wallX, 10);
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(wallX, centerY + massSize / 2);
    ctx.lineTo(w, centerY + massSize / 2);
    ctx.stroke();

    // 2. Draw Equilibrium Reference Line (x = 0)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(eqX, centerY - 50);
    ctx.lineTo(eqX, centerY + 35);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('x = 0', eqX, centerY + 48);

    // 3. Draw Spring Coils
    const springStartX = wallX;
    const springEndX = massX - massSize / 2;
    const coils = 12;
    const springDist = springEndX - springStartX;
    const coilWidth = springDist / coils;

    ctx.beginPath();
    ctx.strokeStyle = '#0f2744';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(springStartX, centerY);

    for (let i = 0; i < coils; i++) {
      const cx = springStartX + (i + 0.5) * coilWidth;
      const cy = i % 2 === 0 ? centerY - 14 : centerY + 14;
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(springEndX, centerY);
    ctx.stroke();

    // 4. Draw Oscillating Mass Block
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = '#0f2744';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(massX - massSize / 2, centerY - massSize / 2, massSize, massSize, 6);
    ctx.fill();
    ctx.stroke();

    // Mass Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.m} kg`, massX, centerY + 4);

    // 5. Draw Kinematic Vector Overlays attached to the Mass
    // Velocity Vector (Green, points right/left)
    const vScale = 12;
    const vx = massX + this.v * vScale;
    if (Math.abs(this.v) > 0.05) {
      this.drawVectorArrow(ctx, massX, centerY - 28, vx, centerY - 28, '#16a34a', `v = ${this.v.toFixed(2)} m/s`);
    }

    // Acceleration Vector (Red, points toward equilibrium)
    const aScale = 2.2;
    const ax = massX + this.a * aScale;
    if (Math.abs(this.a) > 0.1) {
      this.drawVectorArrow(ctx, massX, centerY + 28, ax, centerY + 28, '#dc2626', `a = ${this.a.toFixed(1)} m/s²`);
    }
  }

  drawPendulumSystem(ctx, w, h) {
    const pivotX = w * 0.5;
    const pivotY = 30;
    const lengthPx = 150;
    const thetaMax = this.A / 3; // Approx angular amplitude
    const theta = thetaMax * Math.cos(this.omega * this.t);
    const bobX = pivotX + lengthPx * Math.sin(theta);
    const bobY = pivotY + lengthPx * Math.cos(theta);

    // Ceiling Mount
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pivotX - 30, pivotY - 8, 60, 8);

    // Vertical Equilibrium Line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + lengthPx + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pendulum Rod
    ctx.beginPath();
    ctx.strokeStyle = '#0f2744';
    ctx.lineWidth = 2.2;
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Pivot Pin
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Pendulum Bob (Sphere)
    const bobRadius = 18;
    const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, bobRadius);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#0f2744');

    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#0f2744';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Velocity Vector Tangent
    const vTangent = -this.A * this.omega * Math.sin(this.omega * this.t);
    const vx = bobX + vTangent * 12 * Math.cos(theta);
    const vy = bobY - vTangent * 12 * Math.sin(theta);
    if (Math.abs(vTangent) > 0.05) {
      this.drawVectorArrow(ctx, bobX, bobY, vx, vy, '#16a34a', `v`);
    }
  }

  drawVectorArrow(ctx, x1, y1, x2, y2, color, label) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 7;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (label) {
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = color;
      ctx.fillText(label, x2 + (Math.cos(angle) > 0 ? 5 : -25), y2 - 6);
    }
  }

  renderPhaseSpace() {
    if (!this.phaseCtx) return;
    const ctx = this.phaseCtx;
    const w = this.phaseWidth;
    const h = this.phaseHeight;

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const scaleX = (w * 0.38) / Math.max(0.5, this.A);
    const scaleY = (h * 0.38) / Math.max(0.5, this.A);

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.moveTo(10, cy);
    ctx.lineTo(w - 10, cy);
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx, h - 10);
    ctx.stroke();

    ctx.font = '8px JetBrains Mono, monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('x', w - 12, cy - 4);
    ctx.fillText('v/ω', cx + 4, 14);

    // Theoretical Closed Orbit (Circle in normalized coords)
    ctx.beginPath();
    ctx.ellipse(cx, cy, this.A * scaleX, this.A * scaleY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Current State Point in Phase Space
    const currentPx = cx + this.x * scaleX;
    const currentPy = cy - (this.v / this.omega) * scaleY;

    ctx.beginPath();
    ctx.arc(currentPx, currentPy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ea580c';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  renderOscilloscope() {
    if (!this.oscCtx) return;
    const ctx = this.oscCtx;
    const w = this.oscWidth;
    const h = this.oscHeight;

    ctx.clearRect(0, 0, w, h);

    // CRT Dark Screen Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    const gridStep = 24;
    for (let x = 0; x < w; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center Baseline
    const midY = h * 0.5;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    if (this.waveHistory.length < 2) return;

    const scaleAmp = (h * 0.38) / Math.max(0.5, this.A);
    const stepX = w / this.maxHistory;

    // Helper to draw signal line
    const drawSignal = (extractor, color, lineWidth) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;

      this.waveHistory.forEach((pt, i) => {
        const sx = i * stepX;
        const sy = midY - extractor(pt) * scaleAmp;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset
    };

    // 1. Acceleration Waveform (Red)
    drawSignal((pt) => pt.a * this.A, '#f87171', 1.5);
    // 2. Velocity Waveform (Green)
    drawSignal((pt) => pt.v * this.A, '#4ade80', 1.8);
    // 3. Elongation Position Waveform (Cyan)
    drawSignal((pt) => pt.x, '#38bdf8', 2.4);
  }

  updateEnergyMeters() {
    const kBar = document.getElementById('energy-bar-k');
    const pBar = document.getElementById('energy-bar-p');
    const tBar = document.getElementById('energy-bar-total');

    const kVal = document.getElementById('energy-val-k');
    const pVal = document.getElementById('energy-val-p');
    const tVal = document.getElementById('energy-val-total');

    const maxE = Math.max(0.1, 0.5 * this.k * this.A * this.A);

    if (kBar) kBar.style.width = `${Math.min(100, (this.Ek / maxE) * 100)}%`;
    if (pBar) pBar.style.width = `${Math.min(100, (this.Ep / maxE) * 100)}%`;
    if (tBar) tBar.style.width = '100%';

    if (kVal) kVal.textContent = `${this.Ek.toFixed(2)} J`;
    if (pVal) pVal.textContent = `${this.Ep.toFixed(2)} J`;
    if (tVal) tVal.textContent = `${this.Etotal.toFixed(2)} J`;
  }

  updateReadoutPills() {
    const omegaPill = document.getElementById('sim-readout-omega');
    const tPill = document.getElementById('sim-readout-t');
    const fPill = document.getElementById('sim-readout-f');

    if (omegaPill) omegaPill.textContent = `${this.omega.toFixed(2)} rad/s`;
    if (tPill) tPill.textContent = `${this.T.toFixed(2)} s`;
    if (fPill) fPill.textContent = `${this.f.toFixed(2)} Hz`;
  }

  bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.initCanvases();
    });

    // Play/Pause
    const playBtn = document.getElementById('sim-btn-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.isRunning = !this.isRunning;
        playBtn.innerHTML = this.isRunning
          ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pausar`
          : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> Reanudar`;
      });
    }

    // Step button
    const stepBtn = document.getElementById('sim-btn-step');
    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        this.isRunning = false;
        this.t += 0.05;
        this.stepPhysics();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('sim-btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.t = 0;
        this.waveHistory = [];
        this.stepPhysics();
      });
    }

    // Mode Switch: Spring vs Pendulum
    const tabSpring = document.getElementById('tab-sim-spring');
    const tabPendulum = document.getElementById('tab-sim-pendulum');

    if (tabSpring && tabPendulum) {
      tabSpring.addEventListener('click', () => {
        this.mode = 'spring';
        tabSpring.classList.add('active');
        tabPendulum.classList.remove('active');
        this.updateFrequencies();
        this.waveHistory = [];
      });
      tabPendulum.addEventListener('click', () => {
        this.mode = 'pendulum';
        tabPendulum.classList.add('active');
        tabSpring.classList.remove('active');
        this.updateFrequencies();
        this.waveHistory = [];
      });
    }

    // Parameter Sliders: Mass, K, Amplitude
    const sliderM = document.getElementById('sim-slider-m');
    const sliderK = document.getElementById('sim-slider-k');
    const sliderA = document.getElementById('sim-slider-a');

    if (sliderM) {
      sliderM.addEventListener('input', (e) => {
        this.m = parseFloat(e.target.value);
        document.getElementById('sim-val-m').textContent = `${this.m.toFixed(1)} kg`;
        this.updateFrequencies();
      });
    }

    if (sliderK) {
      sliderK.addEventListener('input', (e) => {
        this.k = parseFloat(e.target.value);
        document.getElementById('sim-val-k').textContent = `${this.k.toFixed(0)} N/m`;
        this.updateFrequencies();
      });
    }

    if (sliderA) {
      sliderA.addEventListener('input', (e) => {
        this.A = parseFloat(e.target.value);
        document.getElementById('sim-val-a').textContent = `${this.A.toFixed(2)} m`;
        this.waveHistory = [];
      });
    }
  }
}

// Global Export
window.PhysicsLab = PhysicsLab;

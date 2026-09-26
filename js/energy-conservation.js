/* ==========================================================================
   SIMULADOR DE CONSERVACIÓN DE ENERGÍA EN EL M.A.S.
   Motor de Renderizado Canvas 2D con Animación en Tiempo Real
   ========================================================================== */

(function () {
  'use strict';

  /* ── State ── */
  const state = {
    // Physics Parameters
    amplitude: 2.0,    // A (m)
    omega: 2.0,        // ω (rad/s)
    mass: 1.0,         // m (kg)
    k: 4.0,            // k = mω² (N/m)

    // Animation
    time: 0,
    running: true,
    speed: 1.0,
    lastFrame: null,

    // Colors (user-configurable)
    colors: {
      potential: '#f59e0b',
      kinetic:  '#3b82f6',
      total:    '#10b981',
      particle: '#f472b6',
    },

    // View
    showGrid: true,
    showBarChart: true,

    // Canvas
    canvas: null,
    ctx: null,
    dpr: 1,
    W: 0,
    H: 0,
  };

  /* ── Physics Helpers ── */
  function recalcK() {
    state.k = state.mass * state.omega * state.omega;
  }

  function position(t) {
    return state.amplitude * Math.cos(state.omega * t);
  }

  function potentialEnergy(x) {
    return 0.5 * state.k * x * x;
  }

  function kineticEnergy(x) {
    const totalE = totalEnergy();
    return totalE - potentialEnergy(x);
  }

  function totalEnergy() {
    return 0.5 * state.k * state.amplitude * state.amplitude;
  }

  /* ── Canvas Setup ── */
  function initCanvas() {
    state.canvas = document.getElementById('energy-canvas');
    state.ctx = state.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    const rect = state.canvas.parentElement.getBoundingClientRect();
    state.dpr = window.devicePixelRatio || 1;
    state.W = rect.width;
    state.H = rect.height;
    state.canvas.width = state.W * state.dpr;
    state.canvas.height = state.H * state.dpr;
    state.canvas.style.width = state.W + 'px';
    state.canvas.style.height = state.H + 'px';
    state.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  /* ── Coordinate Mapping ── */
  // World: x ∈ [-xRange, xRange], y ∈ [0, yRange]
  function getWorldBounds() {
    const xRange = state.amplitude * 1.6;
    const yRange = totalEnergy() * 1.5;
    return { xRange, yRange };
  }

  function worldToScreen(wx, wy) {
    const { xRange, yRange } = getWorldBounds();
    const margin = { left: 60, right: 40, top: 40, bottom: 70 };
    const plotW = state.W - margin.left - margin.right;
    const plotH = state.H - margin.top - margin.bottom;
    const sx = margin.left + ((wx + xRange) / (2 * xRange)) * plotW;
    const sy = margin.top + plotH - (wy / yRange) * plotH;
    return { x: sx, y: sy };
  }

  function getPlotArea() {
    const margin = { left: 60, right: 40, top: 40, bottom: 70 };
    return {
      x: margin.left,
      y: margin.top,
      w: state.W - margin.left - margin.right,
      h: state.H - margin.top - margin.bottom,
    };
  }

  /* ── Drawing ── */
  function render() {
    const ctx = state.ctx;
    const W = state.W;
    const H = state.H;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const { xRange, yRange } = getWorldBounds();
    const plot = getPlotArea();
    const ET = totalEnergy();

    // Grid
    if (state.showGrid) {
      drawGrid(ctx, plot, xRange, yRange);
    }

    // Axes
    drawAxes(ctx, plot, xRange, yRange);

    // Potential Energy Parabola U(x) = ½kx²
    drawParabola(ctx, plot, xRange, yRange);

    // Total Energy Line E_T = const
    drawTotalLine(ctx, plot, xRange, yRange, ET);

    // Current position
    const x = position(state.time);
    const U = potentialEnergy(x);
    const K = kineticEnergy(x);

    // Energy bars at particle position
    drawEnergyBars(ctx, x, U, K, ET);

    // Particle on x-axis
    drawParticle(ctx, x);

    // Bar chart (optional overlay)
    if (state.showBarChart) {
      drawBarChart(ctx, U, K, ET);
    }

    // Update readouts
    updateReadouts(x, U, K, ET);
  }

  function drawGrid(ctx, plot, xRange, yRange) {
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,0.25)';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xStep = getGridStep(xRange * 2, plot.w, 60);
    for (let wx = -Math.ceil(xRange / xStep) * xStep; wx <= xRange; wx += xStep) {
      const p = worldToScreen(wx, 0);
      ctx.beginPath();
      ctx.moveTo(p.x, plot.y);
      ctx.lineTo(p.x, plot.y + plot.h);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yStep = getGridStep(yRange, plot.h, 50);
    for (let wy = 0; wy <= yRange; wy += yStep) {
      const p = worldToScreen(0, wy);
      ctx.beginPath();
      ctx.moveTo(plot.x, p.y);
      ctx.lineTo(plot.x + plot.w, p.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function getGridStep(range, pixels, targetSpacingPx) {
    const raw = range * (targetSpacingPx / pixels);
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
    const residual = raw / magnitude;
    if (residual <= 1.5) return magnitude;
    if (residual <= 3.5) return 2 * magnitude;
    if (residual <= 7.5) return 5 * magnitude;
    return 10 * magnitude;
  }

  function drawAxes(ctx, plot, xRange, yRange) {
    ctx.save();

    // Axis lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    // X-Axis (y=0)
    const origin = worldToScreen(0, 0);
    ctx.beginPath();
    ctx.moveTo(plot.x, origin.y);
    ctx.lineTo(plot.x + plot.w, origin.y);
    ctx.stroke();

    // Y-Axis (x=0)
    ctx.beginPath();
    ctx.moveTo(origin.x, plot.y);
    ctx.lineTo(origin.x, plot.y + plot.h);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    // X-axis tick labels
    const xStep = getGridStep(xRange * 2, plot.w, 80);
    for (let wx = -Math.ceil(xRange / xStep) * xStep; wx <= xRange; wx += xStep) {
      if (Math.abs(wx) < 0.001) continue;
      const p = worldToScreen(wx, 0);
      if (p.x < plot.x || p.x > plot.x + plot.w) continue;
      ctx.fillText(wx.toFixed(1), p.x, origin.y + 20);
    }

    // Y-axis tick labels
    ctx.textAlign = 'right';
    const yStep = getGridStep(yRange, plot.h, 60);
    for (let wy = 0; wy <= yRange; wy += yStep) {
      if (wy < 0.001) continue;
      const p = worldToScreen(0, wy);
      if (p.y < plot.y || p.y > plot.y + plot.h) continue;
      ctx.fillText(wy.toFixed(1), origin.x - 10, p.y + 4);
    }

    // Axis titles
    ctx.fillStyle = '#475569';
    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Posición x (m)', plot.x + plot.w / 2, plot.y + plot.h + 50);

    ctx.save();
    ctx.translate(18, plot.y + plot.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energía (J)', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  function drawParabola(ctx, plot, xRange, yRange) {
    ctx.save();
    ctx.beginPath();

    const steps = 200;
    let first = true;
    for (let i = 0; i <= steps; i++) {
      const wx = -xRange + (2 * xRange * i) / steps;
      const wy = potentialEnergy(wx);
      if (wy > yRange * 1.2) continue;
      const p = worldToScreen(wx, wy);
      if (p.x < plot.x - 2 || p.x > plot.x + plot.w + 2) continue;
      if (first) { ctx.moveTo(p.x, p.y); first = false; }
      else ctx.lineTo(p.x, p.y);
    }

    ctx.strokeStyle = state.colors.potential;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Label
    const labelX = state.amplitude * 0.65;
    const labelY = potentialEnergy(labelX);
    const lp = worldToScreen(labelX, labelY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = state.colors.potential;
    ctx.font = '700 14px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('U(x) = ½kx²', lp.x + 12, lp.y - 8);

    ctx.restore();
  }

  function drawTotalLine(ctx, plot, xRange, yRange, ET) {
    ctx.save();
    const pL = worldToScreen(-xRange, ET);
    const pR = worldToScreen(xRange, ET);

    ctx.beginPath();
    ctx.moveTo(Math.max(pL.x, plot.x), pL.y);
    ctx.lineTo(Math.min(pR.x, plot.x + plot.w), pR.y);

    ctx.strokeStyle = state.colors.total;
    ctx.lineWidth = 3;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.setLineDash([8, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = state.colors.total;
    ctx.font = '700 14px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('E_T = ½kA²', Math.max(pL.x, plot.x) + 12, pL.y - 10);

    ctx.restore();
  }

  function drawEnergyBars(ctx, x, U, K, ET) {
    ctx.save();

    const pBase = worldToScreen(x, 0);
    const pU = worldToScreen(x, U);
    const pET = worldToScreen(x, ET);

    // Potential Energy bar (from x-axis to parabola)
    ctx.beginPath();
    ctx.moveTo(pBase.x, pBase.y);
    ctx.lineTo(pU.x, pU.y);
    ctx.strokeStyle = state.colors.kinetic;
    ctx.lineWidth = 5;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Label U_k
    const midBase = { x: (pBase.x + pU.x) / 2, y: (pBase.y + pU.y) / 2 };
    ctx.shadowBlur = 0;
    ctx.fillStyle = state.colors.kinetic;
    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    if (U > totalEnergy() * 0.08) {
      ctx.fillText('U', midBase.x + 10, midBase.y);
    }

    // Kinetic Energy bar (from parabola to E_T line)
    ctx.beginPath();
    ctx.moveTo(pU.x, pU.y);
    ctx.lineTo(pET.x, pET.y);
    ctx.strokeStyle = state.colors.potential;
    ctx.lineWidth = 5;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Label E_c
    const midTop = { x: (pU.x + pET.x) / 2, y: (pU.y + pET.y) / 2 };
    ctx.shadowBlur = 0;
    ctx.fillStyle = state.colors.potential;
    ctx.font = '700 13px "Outfit", sans-serif';
    if (K > totalEnergy() * 0.08) {
      ctx.fillText('K', midTop.x + 10, midTop.y);
    }

    // Diamond markers at intersections
    drawDiamond(ctx, pU.x, pU.y, 6, state.colors.particle);
    drawDiamond(ctx, pET.x, pET.y, 6, state.colors.total);

    ctx.restore();
  }

  function drawDiamond(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawParticle(ctx, x) {
    ctx.save();
    const p = worldToScreen(x, 0);
    const r = 14;

    // Glow
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
    grad.addColorStop(0, state.colors.particle + '66');
    grad.addColorStop(1, state.colors.particle + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid ball
    const ballGrad = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, r);
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.4, state.colors.particle);
    ballGrad.addColorStop(1, shadeColor(state.colors.particle, -30));
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Trail
    drawTrail(ctx, x);

    ctx.restore();
  }

  function drawTrail(ctx, currentX) {
    ctx.save();
    const origin = worldToScreen(0, 0);
    const leftEnd = worldToScreen(-state.amplitude, 0);
    const rightEnd = worldToScreen(state.amplitude, 0);

    // Track line
    ctx.beginPath();
    ctx.moveTo(leftEnd.x, origin.y);
    ctx.lineTo(rightEnd.x, origin.y);
    ctx.strokeStyle = 'rgba(148,163,184,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Amplitude markers
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('-A', leftEnd.x, origin.y + 22);
    ctx.fillText('+A', rightEnd.x, origin.y + 22);

    // Ticks at amplitude ends
    [leftEnd, rightEnd].forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x, origin.y - 6);
      ctx.lineTo(p.x, origin.y + 6);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawBarChart(ctx, U, K, ET) {
    ctx.save();
    const barW = 28;
    const barMaxH = 80;
    const baseX = state.W - 50;
    const baseY = state.H - 90;
    const gap = 10;

    // Background
    const bgX = baseX - barW * 3 - gap * 2 - 20;
    const bgY = baseY - barMaxH - 30;
    const bgW = barW * 3 + gap * 2 + 40;
    const bgH = barMaxH + 60;

    ctx.fillStyle = 'rgba(248,250,252,0.92)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    roundRect(ctx, bgX, bgY, bgW, bgH, 10);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BALANCE ENERGÉTICO', bgX + bgW / 2, bgY + 16);

    // Draw bars
    const bars = [
      { value: U, color: state.colors.potential, label: 'U' },
      { value: K, color: state.colors.kinetic, label: 'K' },
      { value: ET, color: state.colors.total, label: 'E_T' },
    ];

    bars.forEach((bar, i) => {
      const h = ET > 0 ? (bar.value / ET) * barMaxH : 0;
      const x = baseX - (3 - i) * (barW + gap);
      const y = baseY - h;

      // Bar
      const barGrad = ctx.createLinearGradient(x, y, x, baseY);
      barGrad.addColorStop(0, bar.color);
      barGrad.addColorStop(1, shadeColor(bar.color, -40));
      ctx.fillStyle = barGrad;
      roundRect(ctx, x, y, barW, h, 4);
      ctx.fill();

      // Glow
      ctx.shadowColor = bar.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = bar.color + '33';
      roundRect(ctx, x, y, barW, h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Value
      ctx.fillStyle = bar.color;
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(bar.value.toFixed(2), x + barW / 2, y - 6);

      // Label
      ctx.fillStyle = '#475569';
      ctx.font = '600 10px "Outfit", sans-serif';
      ctx.fillText(bar.label, x + barW / 2, baseY + 14);
    });

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  /* ── Readouts ── */
  function updateReadouts(x, U, K, ET) {
    setText('rdt-U-val', U.toFixed(3) + ' J');
    setText('rdt-K-val', K.toFixed(3) + ' J');
    setText('rdt-ET-val', ET.toFixed(3) + ' J');
    setText('rdt-x-val', x.toFixed(3) + ' m');
    setText('info-time', 't = ' + state.time.toFixed(2) + 's');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ── Animation Loop ── */
  function animate(timestamp) {
    if (!state.lastFrame) state.lastFrame = timestamp;
    const dt = (timestamp - state.lastFrame) / 1000;
    state.lastFrame = timestamp;

    if (state.running) {
      state.time += dt * state.speed;
    }

    render();
    requestAnimationFrame(animate);
  }

  /* ── UI Bindings ── */
  function bindControls() {
    // Amplitude
    bindSlider('param-amp', 'val-amp', (v) => {
      state.amplitude = v;
      recalcK();
    }, (v) => v.toFixed(1) + ' m');

    // Omega
    bindSlider('param-omega', 'val-omega', (v) => {
      state.omega = v;
      recalcK();
    }, (v) => v.toFixed(1) + ' rad/s');

    // Mass
    bindSlider('param-mass', 'val-mass', (v) => {
      state.mass = v;
      recalcK();
    }, (v) => v.toFixed(1) + ' kg');

    // Play/Pause
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        state.running = true;
      });
    }
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        state.running = false;
      });
    }

    // Reset
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.time = 0;
        state.lastFrame = null;
        state.running = true;
      });
    }

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.speed = parseFloat(btn.dataset.speed);
      });
    });

    // Color pickers
    bindColorPicker('color-potential', 'potential');
    bindColorPicker('color-kinetic', 'kinetic');
    bindColorPicker('color-total', 'total');
    bindColorPicker('color-particle', 'particle');

    // Toggles
    bindToggle('toggle-grid', (checked) => { state.showGrid = checked; });
    bindToggle('toggle-bars', (checked) => { state.showBarChart = checked; });
  }

  function bindSlider(sliderId, valId, onChange, formatter) {
    const slider = document.getElementById(sliderId);
    const valEl = document.getElementById(valId);
    if (!slider || !valEl) return;

    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      onChange(v);
      valEl.textContent = formatter(v);
    });
  }

  function bindColorPicker(id, colorKey) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state.colors[colorKey];
    el.addEventListener('input', () => {
      state.colors[colorKey] = el.value;
      // Update the swatch background
      const swatch = el.closest('.color-swatch');
      if (swatch) swatch.style.background = el.value;
    });
  }

  function bindToggle(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      onChange(el.checked);
    });
  }

  /* ── Init ── */
  function init() {
    initCanvas();
    recalcK();
    bindControls();

    // Initialize color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      const input = swatch.querySelector('input[type="color"]');
      if (input) {
        swatch.style.background = input.value;
      }
    });

    requestAnimationFrame(animate);
  }

  // KaTeX auto-render on load
  document.addEventListener('DOMContentLoaded', () => {
    init();

    // Render KaTeX if available
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
      });
    }
  });

})();

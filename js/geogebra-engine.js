/**
 * GEOGEBRA CARTESIAN PLANE ENGINE
 * Motor de lienzo cartesiano interactivo estilo GeoGebra con papel milimetrado,
 * reglas sobre los ejes, graduaciones dinámicas, re-escalamiento independiente de ejes,
 * herramientas de zoom/pan y paleta de personalización gráfica.
 * 
 * Desarrollado por el Equipo Multidisciplinar de IA
 */

class GeoGebraPlane {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Physical / Graph Parameters
    this.params = {
      A: options.A || 2.0,       // Amplitud (m)
      omega: options.omega || 2.0,// Frecuencia angular (rad/s)
      phi: options.phi || 0.0,   // Fase inicial (rad)
      t0: 1.0                    // Tiempo para vector tangente
    };

    // Viewport Coordinates & Scaling
    this.originX = 0;
    this.originY = 0;
    this.scaleX = 60; // Pixels per physical unit on X (time in seconds)
    this.scaleY = 50; // Pixels per physical unit on Y (amplitude/units)
    this.minScale = 15;
    this.maxScale = 300;

    // Interaction State
    this.isDragging = false;
    this.dragMode = 'pan'; // 'pan', 'scale-x', 'scale-y'
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.hoverCoord = { x: 0, y: 0 };
    this.activeTool = 'pan'; // 'pan', 'inspect'

    // Graphic Styles for curves
    this.activeCurve = 'x'; // 'x', 'v', 'a'
    this.styles = {
      x: {
        visible: true,
        name: 'Elongación x(t)',
        color: '#0284c7', // GeoGebra Blue
        width: 2.5,
        dash: []
      },
      v: {
        visible: true,
        name: 'Velocidad v(t)',
        color: '#16a34a', // Emerald Green
        width: 2.5,
        dash: [6, 4]
      },
      a: {
        visible: true,
        name: 'Aceleración a(t)',
        color: '#dc2626', // Crimson Red
        width: 2.5,
        dash: [2, 3]
      }
    };

    this.showTangent = true;
    this.initCanvasSize();
    this.initDefaultView();
    this.bindEvents();
    this.render();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 700;
    this.height = rect.height || 380;
    
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  initDefaultView() {
    this.originX = this.width * 0.15; // Left margin so time t >= 0 is well visible
    this.originY = this.height * 0.5;  // Centered vertically
  }

  // Coordinate Conversion
  toScreenX(x) { return this.originX + x * this.scaleX; }
  toScreenY(y) { return this.originY - y * this.scaleY; }
  toMathX(px) { return (px - this.originX) / this.scaleX; }
  toMathY(py) { return (this.originY - py) / this.scaleY; }

  // Step size calculation for millimeter style grid
  calculateGridStep(scale) {
    const minPixelStep = 50;
    const roughStep = minPixelStep / scale;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    let step;
    if (normalized < 1.5) step = 1 * magnitude;
    else if (normalized < 3.5) step = 2 * magnitude;
    else if (normalized < 7.5) step = 5 * magnitude;
    else step = 10 * magnitude;

    return step;
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Draw Millimeter Paper Grid (Cuadrícula menor y mayor)
    this.drawMillimeterGrid();

    // Draw Axes with Rulers, Ticks and Numbers
    this.drawAxes();

    // Draw Function Curves
    this.drawCurves();

    // Draw Tangent Vector if enabled
    if (this.showTangent) {
      this.drawTangentVector();
    }
  }

  drawMillimeterGrid() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const stepX = this.calculateGridStep(this.scaleX);
    const stepY = this.calculateGridStep(this.scaleY);

    const subStepX = stepX / 5;
    const subStepY = stepY / 5;

    const xMin = this.toMathX(0);
    const xMax = this.toMathX(w);
    const yMin = this.toMathY(h);
    const yMax = this.toMathY(0);

    // 1. Minor Millimeter Grid (Subdivisiones)
    ctx.beginPath();
    ctx.strokeStyle = '#f1f5f9'; // Very soft millimeter line
    ctx.lineWidth = 0.75;
    ctx.setLineDash([]);

    const startSubX = Math.floor(xMin / subStepX) * subStepX;
    for (let x = startSubX; x <= xMax; x += subStepX) {
      const sx = this.toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }

    const startSubY = Math.floor(yMin / subStepY) * subStepY;
    for (let y = startSubY; y <= yMax; y += subStepY) {
      const sy = this.toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();

    // 2. Major Grid (Cuadrícula mayor)
    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1'; // Prominent division line
    ctx.lineWidth = 1.0;

    const startMajorX = Math.floor(xMin / stepX) * stepX;
    for (let x = startMajorX; x <= xMax; x += stepX) {
      const sx = this.toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
    }

    const startMajorY = Math.floor(yMin / stepY) * stepY;
    for (let y = startMajorY; y <= yMax; y += stepY) {
      const sy = this.toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
    }
    ctx.stroke();
  }

  drawAxes() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const stepX = this.calculateGridStep(this.scaleX);
    const stepY = this.calculateGridStep(this.scaleY);
    const subStepX = stepX / 5;
    const subStepY = stepY / 5;

    const xMin = this.toMathX(0);
    const xMax = this.toMathX(w);
    const yMin = this.toMathY(h);
    const yMax = this.toMathY(0);

    const axisX_Screen = Math.max(20, Math.min(h - 20, this.originY));
    const axisY_Screen = Math.max(30, Math.min(w - 30, this.originX));

    // Draw Main Axis Lines
    ctx.beginPath();
    ctx.strokeStyle = '#0f2744'; // GeoGebra deep navy axis
    ctx.lineWidth = 1.8;
    ctx.setLineDash([]);

    // X-Axis
    ctx.moveTo(0, this.originY);
    ctx.lineTo(w, this.originY);

    // Y-Axis
    ctx.moveTo(this.originX, 0);
    ctx.lineTo(this.originX, h);
    ctx.stroke();

    // Arrowheads for Axes
    this.drawArrowhead(w, this.originY, 0);
    this.drawArrowhead(this.originX, 0, -Math.PI / 2);

    // Axis Labels
    ctx.fillStyle = '#0f2744';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('t (s)', w - 10, this.originY - 10);
    ctx.textAlign = 'left';
    ctx.fillText('f(t)', this.originX + 10, 16);

    // Ticks and Numbers on X-Axis
    ctx.font = '500 10px JetBrains Mono, monospace';
    const startMajorX = Math.floor(xMin / stepX) * stepX;
    for (let x = startMajorX; x <= xMax; x += stepX) {
      if (Math.abs(x) < 1e-7) continue; // Skip zero on tick text to avoid clutter
      const sx = this.toScreenX(x);
      
      // Major tick mark
      ctx.beginPath();
      ctx.strokeStyle = '#0f2744';
      ctx.lineWidth = 1.5;
      ctx.moveTo(sx, this.originY - 5);
      ctx.lineTo(sx, this.originY + 5);
      ctx.stroke();

      // Number on tick
      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      const label = Number(x.toFixed(2)).toString();
      ctx.fillText(label, sx, this.originY + 16);

      // Minor Sub-ticks (regla graduada)
      for (let s = 1; s < 5; s++) {
        const subX = x + s * subStepX;
        const subSx = this.toScreenX(subX);
        if (subSx > 0 && subSx < w) {
          ctx.beginPath();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.moveTo(subSx, this.originY - 2.5);
          ctx.lineTo(subSx, this.originY + 2.5);
          ctx.stroke();
        }
      }
    }

    // Ticks and Numbers on Y-Axis
    const startMajorY = Math.floor(yMin / stepY) * stepY;
    for (let y = startMajorY; y <= yMax; y += stepY) {
      if (Math.abs(y) < 1e-7) continue;
      const sy = this.toScreenY(y);

      // Major tick mark
      ctx.beginPath();
      ctx.strokeStyle = '#0f2744';
      ctx.lineWidth = 1.5;
      ctx.moveTo(this.originX - 5, sy);
      ctx.lineTo(this.originX + 5, sy);
      ctx.stroke();

      // Number on tick
      ctx.textAlign = 'right';
      ctx.fillStyle = '#334155';
      const label = Number(y.toFixed(2)).toString();
      ctx.fillText(label, this.originX - 8, sy + 3.5);

      // Minor Sub-ticks (regla graduada)
      for (let s = 1; s < 5; s++) {
        const subY = y + s * subStepY;
        const subSy = this.toScreenY(subY);
        if (subSy > 0 && subSy < h) {
          ctx.beginPath();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.moveTo(this.originX - 2.5, subSy);
          ctx.lineTo(this.originX + 2.5, subSy);
          ctx.stroke();
        }
      }
    }

    // Origin (0,0) Label
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.fillText('0', this.originX - 6, this.originY + 14);
  }

  drawArrowhead(x, y, angle) {
    const ctx = this.ctx;
    const size = 7;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 1.5, -size * 0.7);
    ctx.lineTo(-size * 1.2, 0);
    ctx.lineTo(-size * 1.5, size * 0.7);
    ctx.closePath();
    ctx.fillStyle = '#0f2744';
    ctx.fill();
    ctx.restore();
  }

  drawCurves() {
    const ctx = this.ctx;
    const w = this.width;
    const { A, omega, phi } = this.params;

    const stepPx = 1.5; // Fine screen-pixel sampling for smoothness

    // Helper to evaluate harmonic functions
    const evalX = (t) => A * Math.cos(omega * t + phi);
    const evalV = (t) => -A * omega * Math.sin(omega * t + phi);
    const evalA = (t) => -A * omega * omega * Math.cos(omega * t + phi);

    // Function list in order of drawing
    const curves = [
      { key: 'a', fn: evalA, style: this.styles.a },
      { key: 'v', fn: evalV, style: this.styles.v },
      { key: 'x', fn: evalX, style: this.styles.x }
    ];

    curves.forEach(({ key, fn, style }) => {
      if (!style.visible) return;

      ctx.beginPath();
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width;
      ctx.setLineDash(style.dash);

      let isFirst = true;
      for (let px = 0; px <= w; px += stepPx) {
        const t = this.toMathX(px);
        const val = fn(t);
        const py = this.toScreenY(val);

        if (isFirst) {
          ctx.moveTo(px, py);
          isFirst = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  drawTangentVector() {
    const ctx = this.ctx;
    const { A, omega, phi, t0 } = this.params;
    const sx0 = this.toScreenX(t0);
    const xVal = A * Math.cos(omega * t0 + phi);
    const sy0 = this.toScreenY(xVal);

    if (sx0 < 0 || sx0 > this.width) return;

    // Point on curve
    ctx.beginPath();
    ctx.arc(sx0, sy0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tangent slope is v(t0) = dx/dt
    const slope = -A * omega * Math.sin(omega * t0 + phi);
    // Vector visually scaled
    const dt = 0.35;
    const sx1 = this.toScreenX(t0 + dt);
    const sy1 = this.toScreenY(xVal + slope * dt);

    ctx.beginPath();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2.5;
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx1, sy1);
    ctx.stroke();

    // Arrowhead for velocity vector
    const angle = Math.atan2(sy1 - sy0, sx1 - sx0);
    this.drawArrowhead(sx1, sy1, angle);

    // Tooltip label near tangent
    ctx.fillStyle = 'rgba(15, 39, 68, 0.9)';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText(`v(${t0}s) = ${slope.toFixed(2)} m/s`, sx1 + 8, sy1);
  }

  // Event Handlers for GeoGebra-style interactions
  bindEvents() {
    const c = this.canvas;

    // Window resize
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.render();
    });

    // Mouse Move (Detection of Axis Hover for manual re-scaling)
    c.addEventListener('mousemove', (e) => {
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      this.hoverCoord = { x: this.toMathX(mx), y: this.toMathY(my) };
      this.updateCoordinateBadge();

      if (this.isDragging) {
        const dx = mx - this.lastMouseX;
        const dy = my - this.lastMouseY;

        if (this.dragMode === 'pan') {
          this.originX += dx;
          this.originY += dy;
        } else if (this.dragMode === 'scale-x') {
          // GeoGebra manual scaling of X-axis!
          const factor = 1 + (dx / 120);
          this.scaleX = Math.max(this.minScale, Math.min(this.maxScale, this.scaleX * factor));
        } else if (this.dragMode === 'scale-y') {
          // GeoGebra manual scaling of Y-axis!
          const factor = 1 - (dy / 120);
          this.scaleY = Math.max(this.minScale, Math.min(this.maxScale, this.scaleY * factor));
        }

        this.lastMouseX = mx;
        this.lastMouseY = my;
        this.render();
        return;
      }

      // Check if mouse is hovering over X-axis or Y-axis
      const distToXAxis = Math.abs(my - this.originY);
      const distToYAxis = Math.abs(mx - this.originX);

      c.classList.remove('axis-x-hover', 'axis-y-hover');
      if (distToXAxis < 12 && mx > this.originX + 20) {
        c.classList.add('axis-x-hover');
        this.updateHint('↔ Arrastra horizontalmente para re-escalar el eje X');
      } else if (distToYAxis < 12) {
        c.classList.add('axis-y-hover');
        this.updateHint('↕ Arrastra verticalmente para re-escalar el eje Y');
      } else {
        this.updateHint('Arrastra para desplazar el plano cartesiano');
      }
    });

    // Mouse Down
    c.addEventListener('mousedown', (e) => {
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      this.isDragging = true;
      this.lastMouseX = mx;
      this.lastMouseY = my;
      c.classList.add('grabbing');

      const distToXAxis = Math.abs(my - this.originY);
      const distToYAxis = Math.abs(mx - this.originX);

      if (distToXAxis < 12 && mx > this.originX + 20) {
        this.dragMode = 'scale-x';
      } else if (distToYAxis < 12) {
        this.dragMode = 'scale-y';
      } else {
        this.dragMode = 'pan';
      }
    });

    // Mouse Up / Leave
    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        c.classList.remove('grabbing');
      }
    });

    // Mouse Wheel Zooming
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      this.zoomAtPoint(mx, my, zoomFactor, zoomFactor);
    }, { passive: false });

    // Touch Support for Mobile / Tablet gestures
    let initialTouchDist = null;
    let initialTouchCenter = null;

    c.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const rect = c.getBoundingClientRect();
        this.isDragging = true;
        this.lastMouseX = t.clientX - rect.left;
        this.lastMouseY = t.clientY - rect.top;
        this.dragMode = 'pan';
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialTouchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const rect = c.getBoundingClientRect();
        initialTouchCenter = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top
        };
      }
    });

    c.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      if (e.touches.length === 1 && this.isDragging) {
        const t = e.touches[0];
        const mx = t.clientX - rect.left;
        const my = t.clientY - rect.top;
        const dx = mx - this.lastMouseX;
        const dy = my - this.lastMouseY;
        this.originX += dx;
        this.originY += dy;
        this.lastMouseX = mx;
        this.lastMouseY = my;
        this.render();
      } else if (e.touches.length === 2 && initialTouchDist) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const factor = currentDist / initialTouchDist;
        if (Math.abs(factor - 1) > 0.02) {
          this.zoomAtPoint(initialTouchCenter.x, initialTouchCenter.y, factor, factor);
          initialTouchDist = currentDist;
        }
      }
    }, { passive: false });

    c.addEventListener('touchend', () => {
      this.isDragging = false;
      initialTouchDist = null;
    });
  }

  zoomAtPoint(px, py, factorX, factorY) {
    const mathX = this.toMathX(px);
    const mathY = this.toMathY(py);

    this.scaleX = Math.max(this.minScale, Math.min(this.maxScale, this.scaleX * factorX));
    this.scaleY = Math.max(this.minScale, Math.min(this.maxScale, this.scaleY * factorY));

    this.originX = px - mathX * this.scaleX;
    this.originY = py + mathY * this.scaleY;

    this.render();
  }

  zoomIn() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.zoomAtPoint(cx, cy, 1.25, 1.25);
  }

  zoomOut() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.zoomAtPoint(cx, cy, 0.8, 0.8);
  }

  resetView() {
    this.scaleX = 60;
    this.scaleY = 50;
    this.initDefaultView();
    this.render();
  }

  setParameters(newParams) {
    Object.assign(this.params, newParams);
    this.render();
  }

  setCurveStyle(curveKey, styleObj) {
    if (this.styles[curveKey]) {
      Object.assign(this.styles[curveKey], styleObj);
      this.render();
    }
  }

  updateCoordinateBadge() {
    const badge = document.getElementById('geo-coord-readout');
    if (badge) {
      badge.textContent = `(t: ${this.hoverCoord.x.toFixed(2)}s, y: ${this.hoverCoord.y.toFixed(2)})`;
    }
  }

  updateHint(text) {
    const hint = document.getElementById('geo-axis-hint-text');
    if (hint) {
      hint.textContent = text;
    }
  }
}

// Global Export
window.GeoGebraPlane = GeoGebraPlane;

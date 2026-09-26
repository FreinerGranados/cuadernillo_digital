/**
 * SHM Graphs Logic
 * Wiring GeoGebraPlane with UI Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize GeoGebra Plane
  const plane = new GeoGebraPlane('geogebra-canvas', {
    A: 2.0,
    omega: 2.0,
    phi: 0.0
  });

  // Render Math with KaTeX
  renderMathInElement(document.body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false}
    ],
    throwOnError: false
  });

  // UI Control Elements
  const paramA = document.getElementById('param-A');
  const paramW = document.getElementById('param-w');
  const paramAlpha = document.getElementById('param-alpha');
  const paramT = document.getElementById('param-t');

  const valA = document.getElementById('val-A');
  const valW = document.getElementById('val-w');
  const valAlpha = document.getElementById('val-alpha');
  const valT = document.getElementById('val-t');

  function updateParams() {
    const A = parseFloat(paramA.value);
    const omega = parseFloat(paramW.value);
    const phi = parseFloat(paramAlpha.value);
    const t0 = parseFloat(paramT.value);

    valA.textContent = A.toFixed(1);
    valW.textContent = omega.toFixed(1);
    valAlpha.textContent = phi.toFixed(2);
    valT.textContent = t0.toFixed(2);

    plane.setParameters({ A, omega, phi, t0 });
  }

  paramA.addEventListener('input', updateParams);
  paramW.addEventListener('input', updateParams);
  paramAlpha.addEventListener('input', updateParams);
  paramT.addEventListener('input', updateParams);

  // Visibility Toggles
  const toggles = {
    x: document.getElementById('toggle-x'),
    v: document.getElementById('toggle-v'),
    a: document.getElementById('toggle-a')
  };

  Object.keys(toggles).forEach(key => {
    toggles[key].addEventListener('change', (e) => {
      plane.setCurveStyle(key, { visible: e.target.checked });
    });
  });

  const toggleTangent = document.getElementById('toggle-tangent');
  toggleTangent.addEventListener('change', (e) => {
    plane.showTangent = e.target.checked;
    plane.render();
  });

  // Toolbar Actions
  const btnPan = document.getElementById('tool-pan');
  const btnSelect = document.getElementById('tool-select');
  const btnZoomIn = document.getElementById('tool-zoom-in');
  const btnZoomOut = document.getElementById('tool-zoom-out');
  const btnReset = document.getElementById('tool-reset');
  const btnPalette = document.getElementById('tool-palette');
  const styleMenu = document.getElementById('style-menu');

  btnPan.addEventListener('click', () => {
    btnPan.classList.add('active');
    btnSelect.classList.remove('active');
    plane.activeTool = 'pan';
  });

  btnSelect.addEventListener('click', () => {
    btnSelect.classList.add('active');
    btnPan.classList.remove('active');
    plane.activeTool = 'inspect';
  });

  btnZoomIn.addEventListener('click', () => plane.zoomIn());
  btnZoomOut.addEventListener('click', () => plane.zoomOut());
  btnReset.addEventListener('click', () => plane.resetView());

  // Palette Menu
  btnPalette.addEventListener('click', () => {
    styleMenu.classList.toggle('hidden');
    if (!styleMenu.classList.contains('hidden')) {
      loadStyleMenuForCurve();
    }
  });

  // Close palette when clicking outside
  document.addEventListener('click', (e) => {
    if (!btnPalette.contains(e.target) && !styleMenu.contains(e.target)) {
      styleMenu.classList.add('hidden');
    }
  });

  // Style Editor Logic
  const styleCurveSelect = document.getElementById('style-curve-select');
  const styleColor = document.getElementById('style-color');
  const styleWidth = document.getElementById('style-width');
  const valWidth = document.getElementById('val-width');
  const styleDash = document.getElementById('style-dash');

  function loadStyleMenuForCurve() {
    const curveKey = styleCurveSelect.value;
    const style = plane.styles[curveKey];
    
    styleColor.value = style.color;
    styleWidth.value = style.width;
    valWidth.textContent = style.width.toFixed(1);
    
    if (style.dash.length === 0) styleDash.value = 'solid';
    else if (style.dash[0] === 6) styleDash.value = 'dashed';
    else styleDash.value = 'dotted';
  }

  function applyStyleChange() {
    const curveKey = styleCurveSelect.value;
    const color = styleColor.value;
    const width = parseFloat(styleWidth.value);
    const dashVal = styleDash.value;
    
    let dash = [];
    if (dashVal === 'dashed') dash = [6, 4];
    else if (dashVal === 'dotted') dash = [2, 3];

    valWidth.textContent = width.toFixed(1);
    
    plane.setCurveStyle(curveKey, { color, width, dash });
    
    // Update the visibility toggle colors to match
    if (curveKey === 'x') document.documentElement.style.setProperty('--x-color', color);
    if (curveKey === 'v') document.documentElement.style.setProperty('--v-color', color);
    if (curveKey === 'a') document.documentElement.style.setProperty('--a-color', color);
  }

  styleCurveSelect.addEventListener('change', loadStyleMenuForCurve);
  styleColor.addEventListener('input', applyStyleChange);
  styleWidth.addEventListener('input', applyStyleChange);
  styleDash.addEventListener('change', applyStyleChange);

});

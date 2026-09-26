/**
 * CUADERNO DIGITAL DE FÍSICA III - APP CONTROLLER
 * Gestión de navegación, zoom, capturas de pantalla, render de KaTeX,
 * búsqueda en glosario e inicialización de laboratorios.
 * 
 * Autores: Sara, Freiner y Daniela
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentPage: 1,
    totalPages: 14,
    zoomLevel: 1.0,
    geoInstance: null,
    physicsInstance: null,
    mindmapInstance: null
  };

  // DOM Elements
  const pages = document.querySelectorAll('.page');
  const pageSelect = document.getElementById('nav-page-select');
  const btnPrev = document.getElementById('nav-btn-prev');
  const btnNext = document.getElementById('nav-btn-next');
  const btnHome = document.getElementById('nav-btn-home');
  const btnZoomIn = document.getElementById('nav-btn-zoom-in');
  const btnZoomOut = document.getElementById('nav-btn-zoom-out');
  const btnZoomReset = document.getElementById('nav-btn-zoom-reset');
  const zoomIndicator = document.getElementById('nav-zoom-level');
  const btnCapture = document.getElementById('nav-btn-capture');
  const btnFullscreen = document.getElementById('nav-btn-fullscreen');
  const toastEl = document.getElementById('toast-notification');
  const viewportEl = document.getElementById('notebook-viewport');

  // Show Toast Message
  function showToast(message, icon = '✓') {
    if (!toastEl) return;
    toastEl.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  // Navigation Logic
  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > state.totalPages) return;

    pages.forEach((p, index) => {
      const pIndex = index + 1;
      if (pIndex === pageNum) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    state.currentPage = pageNum;
    if (pageSelect) pageSelect.value = pageNum;

    // Update button states
    if (btnPrev) btnPrev.disabled = pageNum === 1;
    if (btnNext) btnNext.disabled = pageNum === state.totalPages;

    // Trigger specific page initializations
    onPageEnter(pageNum);

    // Smooth scroll to top of notebook
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onPageEnter(pageNum) {
    // Re-render KaTeX if needed
    renderMath();

    // Page 4: Mind Map
    if (pageNum === 4 && !state.mindmapInstance) {
      setTimeout(() => {
        state.mindmapInstance = new InteractiveMindMap('mindmap-wrapper');
      }, 100);
    }

    // Page 8: GeoGebra Engine
    if (pageNum === 8) {
      setTimeout(() => {
        if (!state.geoInstance) {
          state.geoInstance = new GeoGebraPlane('geogebra-canvas', {
            A: 2.0,
            omega: 2.0,
            phi: 0.0
          });
          setupGeoGebraControls();
        } else {
          state.geoInstance.initCanvasSize();
          state.geoInstance.render();
        }
      }, 100);
    }

    // Page 9: Physics Simulator
    if (pageNum === 9) {
      setTimeout(() => {
        if (!state.physicsInstance) {
          state.physicsInstance = new PhysicsLab();
        } else {
          state.physicsInstance.initCanvases();
        }
      }, 100);
    }
  }

  // Bind Navigation Controls
  if (btnPrev) btnPrev.addEventListener('click', () => goToPage(state.currentPage - 1));
  if (btnNext) btnNext.addEventListener('click', () => goToPage(state.currentPage + 1));
  if (btnHome) btnHome.addEventListener('click', () => goToPage(1));

  if (pageSelect) {
    pageSelect.addEventListener('change', (e) => {
      goToPage(parseInt(e.target.value, 10));
    });
  }

  // Cover Page click to enter
  const coverPage = document.querySelector('.cover-overlay-click');
  if (coverPage) {
    coverPage.addEventListener('click', () => goToPage(2));
  }

  // Keyboard Shortcuts (ArrowLeft, ArrowRight, Home, f)
  window.addEventListener('keydown', (e) => {
    // Don't intercept if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      goToPage(state.currentPage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      goToPage(state.currentPage - 1);
    } else if (e.key === 'Home') {
      goToPage(1);
    } else if (e.key === 'End') {
      goToPage(state.totalPages);
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    }
  });

  // Zoom Controls
  function setZoom(newZoom) {
    state.zoomLevel = Math.max(0.65, Math.min(1.4, newZoom));
    if (viewportEl) {
      viewportEl.style.transform = `scale(${state.zoomLevel})`;
      viewportEl.style.transformOrigin = 'top center';
    }
    if (zoomIndicator) {
      zoomIndicator.textContent = `${Math.round(state.zoomLevel * 100)}%`;
    }
  }

  if (btnZoomIn) btnZoomIn.addEventListener('click', () => setZoom(state.zoomLevel + 0.1));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => setZoom(state.zoomLevel - 0.1));
  if (btnZoomReset) btnZoomReset.addEventListener('click', () => setZoom(1.0));

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      showToast('Pantalla completa activada', '⛶');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        showToast('Pantalla completa desactivada', '⛶');
      }
    }
  }
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Capture Page Screenshot (html2canvas)
  if (btnCapture) {
    btnCapture.addEventListener('click', async () => {
      const activePage = document.querySelector('.page.active');
      if (!activePage) return;

      showToast('Generando captura en alta resolución...', '📷');

      try {
        if (typeof html2canvas === 'undefined') {
          showToast('Librería de captura cargando...', '⏳');
          return;
        }

        const canvas = await html2canvas(activePage, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: null
        });

        const link = document.createElement('a');
        link.download = `Fisica3_Pagina_${state.currentPage}_Sara_Freiner_Daniela.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        showToast(`¡Página ${state.currentPage} capturada con éxito!`, '✨');
      } catch (err) {
        console.error('Error al capturar:', err);
        showToast('No se pudo generar la captura', '⚠️');
      }
    });
  }

  // Setup GeoGebra Toolbar and Palette Buttons
  function setupGeoGebraControls() {
    const geo = state.geoInstance;
    if (!geo) return;

    // Toolbar Buttons
    const btnZIn = document.getElementById('geo-btn-zin');
    const btnZOut = document.getElementById('geo-btn-zout');
    const btnReset = document.getElementById('geo-btn-reset');
    const btnPalette = document.getElementById('geo-btn-palette');
    const palettePopover = document.getElementById('geo-palette-popover');
    const paletteClose = document.getElementById('geo-palette-close');

    if (btnZIn) btnZIn.addEventListener('click', () => geo.zoomIn());
    if (btnZOut) btnZOut.addEventListener('click', () => geo.zoomOut());
    if (btnReset) btnReset.addEventListener('click', () => geo.resetView());

    if (btnPalette && palettePopover) {
      btnPalette.addEventListener('click', (e) => {
        e.stopPropagation();
        palettePopover.classList.toggle('open');
      });
    }

    if (paletteClose && palettePopover) {
      paletteClose.addEventListener('click', () => {
        palettePopover.classList.remove('open');
      });
    }

    // Close palette when clicking outside
    document.addEventListener('click', (e) => {
      if (palettePopover && !palettePopover.contains(e.target) && e.target !== btnPalette) {
        palettePopover.classList.remove('open');
      }
    });

    // Palette Curve Selection Tabs
    const curveTabs = document.querySelectorAll('.palette-curve-tab');
    curveTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        curveTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        geo.activeCurve = tab.getAttribute('data-curve');
      });
    });

    // Palette Colors
    const colorDots = document.querySelectorAll('.palette-color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        const color = dot.getAttribute('data-color');
        geo.setCurveStyle(geo.activeCurve, { color });
      });
    });

    // Palette Line Widths
    const widthBtns = document.querySelectorAll('.palette-width-btn');
    widthBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        widthBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const width = parseFloat(btn.getAttribute('data-width'));
        geo.setCurveStyle(geo.activeCurve, { width });
      });
    });

    // Palette Line Styles
    const styleBtns = document.querySelectorAll('.palette-style-btn');
    styleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        styleBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const style = btn.getAttribute('data-style');
        let dash = [];
        if (style === 'dashed') dash = [6, 4];
        if (style === 'dotted') dash = [2, 3];
        geo.setCurveStyle(geo.activeCurve, { dash });
      });
    });

    // Sliders for A, omega, phi
    const sA = document.getElementById('geo-slider-amp');
    const sW = document.getElementById('geo-slider-omega');
    const sP = document.getElementById('geo-slider-phi');

    if (sA) {
      sA.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('geo-val-amp').textContent = `${val.toFixed(1)} m`;
        geo.setParameters({ A: val });
      });
    }

    if (sW) {
      sW.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('geo-val-omega').textContent = `${val.toFixed(1)} rad/s`;
        geo.setParameters({ omega: val });
      });
    }

    if (sP) {
      sP.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const piFrac = (val / Math.PI).toFixed(2);
        document.getElementById('geo-val-phi').textContent = `${piFrac}π rad`;
        geo.setParameters({ phi: val });
      });
    }

    // Toggle curves checkboxes
    const chkX = document.getElementById('geo-chk-x');
    const chkV = document.getElementById('geo-chk-v');
    const chkA = document.getElementById('geo-chk-a');
    const chkTan = document.getElementById('geo-chk-tangent');

    if (chkX) chkX.addEventListener('change', (e) => geo.setCurveStyle('x', { visible: e.target.checked }));
    if (chkV) chkV.addEventListener('change', (e) => geo.setCurveStyle('v', { visible: e.target.checked }));
    if (chkA) chkA.addEventListener('change', (e) => geo.setCurveStyle('a', { visible: e.target.checked }));
    if (chkTan) chkTan.addEventListener('change', (e) => {
      geo.showTangent = e.target.checked;
      geo.render();
    });
  }

  // Interactive Glossary Search
  const searchInput = document.getElementById('glossary-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.glossary-card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(q)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // KaTeX Math Rendering
  function renderMath() {
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    }
  }

  // Initial Math rendering
  setTimeout(renderMath, 150);

  // Expose global app navigation helper
  window.goToPage = goToPage;
});

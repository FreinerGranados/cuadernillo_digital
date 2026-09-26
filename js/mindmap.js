/**
 * INTERACTIVE MIND MAP ENGINE
 * Red conceptual interactiva del Movimiento Oscilatorio y M.A.S.
 * Desarrollado por el Equipo Multidisciplinar de IA
 */

class InteractiveMindMap {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.nodes = [
      {
        id: 'center',
        title: 'MOVIMIENTO OSCILATORIO',
        desc: 'Movimiento periódico en torno a una posición de equilibrio estable, regido por fuerzas restauradoras.',
        category: 'Núcleo Teórico',
        x: 50, y: 50, r: 42,
        color: '#0f2744',
        textColor: '#ffffff'
      },
      {
        id: 'periodico',
        title: 'Movimiento Periódico',
        desc: 'Se repite en intervalos regulares de tiempo: Período T (s), Frecuencia f (Hz). Relación: f = 1/T.',
        category: 'Cinemática Temporal',
        x: 20, y: 22, r: 32,
        color: '#0284c7',
        textColor: '#ffffff'
      },
      {
        id: 'mas',
        title: 'Movimiento Armónico Simple (M.A.S.)',
        desc: 'Oscilación lineal ideal donde la fuerza restauradora es proporcional al desplazamiento: F = -k·x (Ley de Hooke).',
        category: 'Dinámica',
        x: 80, y: 22, r: 32,
        color: '#1e3a8a',
        textColor: '#ffffff'
      },
      {
        id: 'cinematica',
        title: 'Cinemática: x(t), v(t), a(t)',
        desc: 'x(t) = A·cos(ωt+ϕ), v(t) = -Aω·sin(ωt+ϕ), a(t) = -ω²·x(t). Desfase de π/2 entre x y v, y de π entre x y a.',
        category: 'Ecuaciones Horarias',
        x: 18, y: 78, r: 32,
        color: '#16a34a',
        textColor: '#ffffff'
      },
      {
        id: 'energia',
        title: 'Conservación de la Energía',
        desc: 'La energía mecánica total es constante: E = Ec + Ep = ½mv² + ½kx² = ½kA². Intercambio continuo cinético-potencial.',
        category: 'Termodinámica y Trabajo',
        x: 82, y: 78, r: 32,
        color: '#d97706',
        textColor: '#ffffff'
      },
      {
        id: 'parametros',
        title: 'Parámetros: A, ω, ϕ₀',
        desc: 'A = Amplitud (desplazamiento máximo), ω = √(k/m) (frecuencia angular en rad/s), ϕ₀ = constante de fase inicial.',
        category: 'Variables de Estado',
        x: 50, y: 12, r: 28,
        color: '#7c3aed',
        textColor: '#ffffff'
      }
    ];

    this.links = [
      { from: 'center', to: 'periodico' },
      { from: 'center', to: 'mas' },
      { from: 'center', to: 'cinematica' },
      { from: 'center', to: 'energia' },
      { from: 'center', to: 'parametros' },
      { from: 'mas', to: 'energia' },
      { from: 'mas', to: 'cinematica' }
    ];

    this.render();
  }

  render() {
    let svgHtml = `
      <svg class="mindmap-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0.7"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f2744" flood-opacity="0.25"/>
          </filter>
        </defs>
    `;

    // Render Links
    this.links.forEach(l => {
      const src = this.nodes.find(n => n.id === l.from);
      const dst = this.nodes.find(n => n.id === l.to);
      if (src && dst) {
        svgHtml += `
          <line x1="${src.x}" y1="${src.y}" x2="${dst.x}" y2="${dst.y}" 
                stroke="url(#linkGrad)" stroke-width="0.7" stroke-dasharray="1.5, 1.5"/>
        `;
      }
    });

    // Render Nodes
    this.nodes.forEach(n => {
      const isCenter = n.id === 'center';
      const r = isCenter ? 12 : 9;
      const fontSize = isCenter ? 2.5 : 2.0;

      svgHtml += `
        <g class="mindmap-node" data-id="${n.id}" transform="translate(0, 0)">
          <circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${n.color}" filter="url(#glow)"/>
          <circle cx="${n.x}" cy="${n.y}" r="${r - 1}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
          <text x="${n.x}" y="${n.y + 0.8}" fill="${n.textColor}" font-size="${fontSize}" 
                font-family="Outfit, sans-serif" font-weight="700" text-anchor="middle">
            ${isCenter ? 'OSCILATORIO' : n.title.split(' ')[0]}
          </text>
        </g>
      `;
    });

    svgHtml += `</svg>`;

    // Add info popup container
    svgHtml += `
      <div id="mindmap-popup" class="mindmap-info-popup">
        <strong id="mm-popup-title">Explora la red conceptual</strong>: 
        <span id="mm-popup-desc">Haz clic o pasa el cursor sobre los nodos para profundizar en sus fundamentos físicos.</span>
      </div>
    `;

    this.container.innerHTML = svgHtml;
    this.bindEvents();
  }

  bindEvents() {
    const nodes = this.container.querySelectorAll('.mindmap-node');
    const titleEl = document.getElementById('mm-popup-title');
    const descEl = document.getElementById('mm-popup-desc');

    nodes.forEach(el => {
      const id = el.getAttribute('data-id');
      const data = this.nodes.find(n => n.id === id);

      const activate = () => {
        if (data && titleEl && descEl) {
          titleEl.textContent = `${data.title} (${data.category})`;
          descEl.textContent = data.desc;
        }
      };

      el.addEventListener('mouseenter', activate);
      el.addEventListener('click', activate);
    });
  }
}

window.InteractiveMindMap = InteractiveMindMap;

import re

files = [
    "c:/Users/usuario/Documents/Fisica 3/pages/cuadernillo.html",
    "c:/Users/usuario/Documents/Fisica 3/pages/shm-graphs.html"
]

menu_html = """
  <!-- Global Navigation Menu -->
  <div class="global-nav-menu">
    <button id="global-nav-toggle" class="global-nav-toggle" aria-label="Abrir Menú">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <div id="global-nav-dropdown" class="global-nav-dropdown">
      <div class="global-nav-header">MENÚ PRINCIPAL</div>
      <ul>
        <li><a href="index.html" class="nav-item">🏠 Inicio / Dashboard</a></li>
        <li><a href="cuadernillo.html" class="nav-item">📖 Cuadernillo Digital</a></li>
        <li><a href="shm-graphs.html" class="nav-item">⚙️ Simulador Interactivo</a></li>
      </ul>
    </div>
  </div>
"""

css_link = '  <link rel="stylesheet" href="../css/global-menu.css">\n</head>'
js_link = '  <script src="../js/global-menu.js"></script>\n</body>'

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if already added
    if "global-nav-menu" not in content:
        # Insert CSS
        content = content.replace("</head>", css_link)
        
        # Insert JS
        content = content.replace("</body>", js_link)
        
        # Insert HTML after <body>
        content = content.replace("<body>", "<body>\n" + menu_html)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

print("Menu injected successfully")

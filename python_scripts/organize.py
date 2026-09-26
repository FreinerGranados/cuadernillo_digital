import os
import shutil
import re

base_dir = "c:/Users/usuario/Documents/Fisica 3"

pages_dir = os.path.join(base_dir, "pages")
js_dir = os.path.join(base_dir, "js")
py_dir = os.path.join(base_dir, "python_scripts")

os.makedirs(pages_dir, exist_ok=True)
os.makedirs(js_dir, exist_ok=True)
os.makedirs(py_dir, exist_ok=True)

# 1. Move HTML files
html_files = [f for f in os.listdir(base_dir) if f.endswith('.html')]
for html in html_files:
    shutil.move(os.path.join(base_dir, html), os.path.join(pages_dir, html))

# 2. Move JS files from root to js/
js_files = [f for f in os.listdir(base_dir) if f.endswith('.js') and not os.path.isdir(os.path.join(base_dir, f))]
for js in js_files:
    shutil.move(os.path.join(base_dir, js), os.path.join(js_dir, js))

# 3. Move PY files to python_scripts/
py_files = [f for f in os.listdir(base_dir) if f.endswith('.py') and not os.path.isdir(os.path.join(base_dir, f))]
for py in py_files:
    shutil.move(os.path.join(base_dir, py), os.path.join(py_dir, py))

# 4. Update links in HTML files (now located in pages/)
for html in html_files:
    filepath = os.path.join(pages_dir, html)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Update css links: href="css/... -> href="../css/...
    content = re.sub(r'href="css/', r'href="../css/', content)
    # Update js links: src="js/... -> src="../js/...
    content = re.sub(r'src="js/', r'src="../js/', content)
    
    # No need to update html links if they are all in the same folder now!
    # "cuadernillo.html" is still "cuadernillo.html"
    # "shm-graphs.html" is still "shm-graphs.html"
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

# 5. Update paths in sw.js (now located in js/)
sw_path = os.path.join(js_dir, "sw.js")
if os.path.exists(sw_path):
    with open(sw_path, "r", encoding="utf-8") as f:
        sw_content = f.read()
    
    # Update paths in array:
    # './index.html' -> '../pages/index.html'
    # './css/...' -> '../css/...'
    # './js/...' -> './...'
    # './imagenes/...' -> '../imagenes/...'
    
    sw_content = sw_content.replace("'./index.html'", "'../pages/index.html'")
    sw_content = sw_content.replace("'./cuadernillo.html'", "'../pages/cuadernillo.html'")
    sw_content = sw_content.replace("'./shm-graphs.html'", "'../pages/shm-graphs.html'")
    
    sw_content = sw_content.replace("'./css/", "'../css/")
    sw_content = sw_content.replace("'./imagenes/", "'../imagenes/")
    
    # Because sw.js is inside js/, other js files are in the same folder
    sw_content = sw_content.replace("'./js/", "'./")
    
    # the fallback in fetch event
    sw_content = sw_content.replace("caches.match('./index.html')", "caches.match('../pages/index.html')")
    
    with open(sw_path, "w", encoding="utf-8") as f:
        f.write(sw_content)

print("Files organized successfully!")

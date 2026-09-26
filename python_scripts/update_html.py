import re

file_path = "c:/Users/usuario/Documents/Fisica 3/index.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the index table in Page 2
index_old = """                  <tr>
                    <td><strong>12</strong></td>
                    <td>Glosario Científico Interactivo de Física III</td>
                    <td>Buscador en Vivo</td>
                    <td><button class="sim-action-btn" onclick="goToPage(12)">Ir</button></td>
                  </tr>
                  <tr>
                    <td><strong>13</strong></td>
                    <td>Referencias Bibliográficas Canónicas (Normas APA 7ma Ed.)</td>
                    <td>Citas Académicas</td>
                    <td><button class="sim-action-btn" onclick="goToPage(13)">Ir</button></td>
                  </tr>"""

index_new = """                  <tr>
                    <td><strong>12</strong></td>
                    <td>Taller de Problemas III: Miscelánea Avanzada</td>
                    <td>Resolución y Simulaciones</td>
                    <td><button class="sim-action-btn" onclick="goToPage(12)">Ir</button></td>
                  </tr>
                  <tr>
                    <td><strong>13</strong></td>
                    <td>Glosario Científico Interactivo de Física III</td>
                    <td>Buscador en Vivo</td>
                    <td><button class="sim-action-btn" onclick="goToPage(13)">Ir</button></td>
                  </tr>
                  <tr>
                    <td><strong>14</strong></td>
                    <td>Referencias Bibliográficas Canónicas (Normas APA 7ma Ed.)</td>
                    <td>Citas Académicas</td>
                    <td><button class="sim-action-btn" onclick="goToPage(14)">Ir</button></td>
                  </tr>"""

content = content.replace(index_old, index_new)

# 2. Insert CSS at the top
head_old = """  <!-- Custom Stylesheets -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/geogebra.css">
  <link rel="stylesheet" href="css/simulations.css">"""

head_new = """  <!-- Custom Stylesheets -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/geogebra.css">
  <link rel="stylesheet" href="css/simulations.css">
  <link rel="stylesheet" href="css/simulations-taller.css">"""

content = content.replace(head_old, head_new)

# 3. Update the bottom dropdown
dropdown_old = """          <option value="11">Pág. 11: Problema Resuelto II</option>
          <option value="12">Pág. 12: Glosario Científico</option>
          <option value="13">Pág. 13: Referencias APA 7</option>
        </select>"""

dropdown_new = """          <option value="11">Pág. 11: Problema Resuelto II</option>
          <option value="12">Pág. 12: Taller de Problemas III</option>
          <option value="13">Pág. 13: Glosario Científico</option>
          <option value="14">Pág. 14: Referencias APA 7</option>
        </select>"""

content = content.replace(dropdown_old, dropdown_new)

# 4. Add the new page and shift page 12->13, 13->14
page_12_glosario_header_old = """        <!-- ================================================================
             PÁGINA 12: GLOSARIO CIENTÍFICO INTERACTIVO
             ================================================================ -->
        <section class="page" id="page-12" aria-label="Glosario científico interactivo">"""

page_12_glosario_header_new = """        <!-- ================================================================
             PÁGINA 13: GLOSARIO CIENTÍFICO INTERACTIVO
             ================================================================ -->
        <section class="page" id="page-13" aria-label="Glosario científico interactivo">"""

# Replace page 12 to 13
content = content.replace(page_12_glosario_header_old, page_12_glosario_header_new)
content = content.replace('<div class="page-num-pill">Pág. 12 de 13</div>', '<div class="page-num-pill">Pág. 13 de 14</div>')

page_13_ref_header_old = """        <!-- ================================================================
             PÁGINA 13: REFERENCIAS BIBLIOGRÁFICAS (NORMAS APA 7)
             ================================================================ -->
        <section class="page" id="page-13" aria-label="Referencias bibliográficas normas APA 7">"""

page_13_ref_header_new = """        <!-- ================================================================
             PÁGINA 14: REFERENCIAS BIBLIOGRÁFICAS (NORMAS APA 7)
             ================================================================ -->
        <section class="page" id="page-14" aria-label="Referencias bibliográficas normas APA 7">"""

content = content.replace(page_13_ref_header_old, page_13_ref_header_new)
content = content.replace('<div class="page-num-pill">Pág. 13 de 13</div>', '<div class="page-num-pill">Pág. 14 de 14</div>')


new_page_html = """        <!-- ================================================================
             PÁGINA 12: TALLER DE PROBLEMAS AVANZADOS
             ================================================================ -->
        <section class="page" id="page-12" aria-label="Taller de Problemas III">
          <div class="page-inner">
            <div class="page-header">
              <div>
                <div class="page-category-badge">Miscelánea de Ejercicios</div>
                <h1 class="page-title">Taller de Problemas III: Análisis Avanzado</h1>
                <div class="page-subtitle">Resolución de problemas con simulaciones dinámicas y formalismo matemático</div>
              </div>
              <div class="page-num-pill">Pág. 12 de 14</div>
            </div>

            <div class="page-content">

              <!-- Ejercicio 1 -->
              <div class="problem-statement-box">
                <strong>Ejercicio 1: Partículas A y B</strong><br>
                La figura muestra dos curvas que representan el movimiento armónico simple al que se someten dos partículas. La descripción correcta de estos dos movimientos es que el movimiento armónico simple de la partícula B es:
                <ul>
                  <li>(a) de mayor frecuencia angular y mayor amplitud que el de la partícula A</li>
                  <li><strong>(b) de mayor frecuencia angular y menor amplitud que el de la partícula A</strong></li>
                  <li>(c) de menor frecuencia angular y mayor amplitud que el de la partícula A</li>
                  <li>(d) de menor frecuencia angular y menor amplitud que el de la partícula A</li>
                </ul>
              </div>
              <div class="protocol-container">
                <div class="step-box step-4-resolucion">
                  <div class="step-header">Resolución Analítica</div>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">
                    Observando la imagen proporcionada, la partícula B realiza más ciclos completos en el mismo intervalo de tiempo en comparación con la partícula A. Esto indica que el período de B es menor, y como $\omega = 2\pi/T$, su <strong>frecuencia angular es mayor</strong>. Además, el desplazamiento vertical máximo de la curva B desde el equilibrio es más corto que el de la curva A, lo que significa que su <strong>amplitud es menor</strong>. Por lo tanto, la respuesta correcta es la <strong>(b)</strong>.
                  </div>
                </div>
                <div class="sim-box">
                  <div class="particle-track">
                    <div class="particle a">A</div>
                    <div class="particle b">B</div>
                  </div>
                </div>
              </div>

              <!-- Ejercicio 2 -->
              <div class="problem-statement-box" style="margin-top:20px;">
                <strong>Ejercicio 2: Colisión de Bolas de Acero</strong><br>
                Dos bolas de acero idénticas de masa $m = 67.4\\text{ g}$ y diámetro $d = 25.4\\text{ mm}$ chocan de frente a $v = 5.00\\text{ m/s}$.<br>
                Grupo (i): Modela con aceleración constante encontrando el tiempo de contacto.<br>
                Grupo (ii): Usa la Ley de Hooke sabiendo que $F = 16.0\\text{ kN}$ reduce el diámetro en $s = 0.200\\text{ mm}$. Modela como medio ciclo de M.A.S. para encontrar el tiempo de contacto.<br>
                ¿Qué resultado es más exacto?
              </div>
              <div class="protocol-container">
                <div class="step-box step-4-resolucion">
                  <div class="step-header">Resolución Analítica</div>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">
                    <strong>Grupo (ii) - M.A.S.:</strong> Constante de rigidez $k = \\frac{F}{s} = \\frac{16.0 \\times 10^3}{0.200 \\times 10^{-3}} = 8.00 \\times 10^7 \\text{ N/m}$.<br>
                    El tiempo de contacto es medio período de oscilación: $\\Delta t = \\frac{T}{2} = \\pi \\sqrt{\\frac{m}{k}} = \\pi \\sqrt{\\frac{0.0674}{8.00 \\times 10^7}} \\approx \\mathbf{9.12 \\times 10^{-5} \\text{ s}}$.<br><br>
                    <strong>Grupo (i) - Aceleración Constante:</strong> La máxima compresión (Amplitud) es $\\frac{1}{2}mv^2 = \\frac{1}{2}kx_{max}^2 \\Rightarrow x_{max} = v\\sqrt{\\frac{m}{k}} = 1.45 \\times 10^{-4} \\text{ m}$. El tiempo de compresión (ida) es $t_{stop} = \\frac{x_{max}}{v_{prom}} = \\frac{2 x_{max}}{v} = 5.80 \\times 10^{-5}\\text{ s}$. El tiempo total de contacto es $2t_{stop} = \\mathbf{1.16 \\times 10^{-4} \\text{ s}}$.<br><br>
                    <strong>Conclusión:</strong> El resultado del <strong>Grupo (ii)</strong> es más exacto ya que las fuerzas de restitución elásticas no son constantes, siguen fielmente la Ley de Hooke ($F=-kx$).
                  </div>
                </div>
                <div class="sim-box">
                  <div class="balls-container">
                    <div class="steel-ball ball-left"></div>
                    <div class="steel-ball ball-right"></div>
                  </div>
                </div>
              </div>

              <!-- Ejercicio 3 -->
              <div class="problem-statement-box" style="margin-top:20px;">
                <strong>Ejercicio 3: Sensibilidad a las Condiciones Iniciales</strong><br>
                (i) Masa $450\\text{ g}$ estira resorte en $35.0\\text{ cm}$. Se baja $18\\text{ cm}$ extra y se suelta.<br>
                (ii) Masa $440\\text{ g}$ estira otro resorte en $35.5\\text{ cm}$. Se baja $18\\text{ cm}$ extra y se suelta.<br>
                (a) Halle la posición $x$ a los $t=84.4\\text{ s}$ y la distancia total recorrida.<br>
                (b) ¿Por qué difieren tanto en posición y (c) qué revela sobre predecir el futuro?
              </div>
              <div class="protocol-container">
                <div class="step-box step-4-resolucion">
                  <div class="step-header">Resolución Analítica</div>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">
                    <strong>Sistema (i):</strong> $k_1 = \\frac{mg}{y_1} = 12.6 \\text{ N/m}$. $\\omega_1 = \\sqrt{12.6/0.450} = 5.291 \\text{ rad/s}$. Ecuación: $x_1(t) = -0.18 \\cos(5.291 t)$.<br>
                    En $t = 84.4 \\text{ s}$, la fase es $446.60 \\text{ rad}$. Posición $x_1(84.4) = -0.18\\cos(446.60) = \\mathbf{+12.4 \\text{ cm}}$. Distancia $\\approx \\mathbf{51.4 \\text{ m}}$.<br><br>
                    <strong>Sistema (ii):</strong> $k_2 = \\frac{mg}{y_2} = 12.15 \\text{ N/m}$. $\\omega_2 = \\sqrt{12.15/0.440} = 5.254 \\text{ rad/s}$. Ecuación: $x_2(t) = -0.18 \\cos(5.254 t)$.<br>
                    En $t = 84.4 \\text{ s}$, la fase es $443.45 \\text{ rad}$. Posición $x_2(84.4) = -0.18\\cos(443.45) = \\mathbf{+3.18 \\text{ cm}}$. Distancia $\\approx \\mathbf{50.9 \\text{ m}}$.<br><br>
                    <strong>(b) y (c):</strong> Difieren ampliamente en posición porque en 84.4 segundos realizan $\\approx 71$ oscilaciones completas. Pequeñas diferencias en $\\omega$ acumulan grandes desfases de ángulo ($\\Delta \\theta > 3 \\text{ rad}$). Esto revela la <strong>sensibilidad a las condiciones iniciales y parámetros</strong>: predecir estados futuros a largo plazo requiere precisión extrema (Teoría del Caos).
                  </div>
                </div>
                <div class="sim-box">
                  <div class="spring-container">
                    <div class="spring-sys sys1">
                      <div class="spring-coil"></div>
                      <div class="spring-mass">450g</div>
                    </div>
                    <div class="spring-sys sys2">
                      <div class="spring-coil"></div>
                      <div class="spring-mass">440g</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ejercicio 4 -->
              <div class="problem-statement-box" style="margin-top:20px;">
                <strong>Ejercicio 4: Pistón de Motor a Gasolina</strong><br>
                Un pistón en M.A.S. corre a $3600\\text{ rev/min}$. Sus extremos respecto al punto central son de $65.00\\text{ cm}$. Encuentre (a) velocidad máxima y (b) aceleración máxima.
              </div>
              <div class="protocol-container">
                <div class="step-box step-4-resolucion">
                  <div class="step-header">Resolución Analítica</div>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">
                    Frecuencia $f = \\frac{3600 \\text{ rev}}{60 \\text{ s}} = 60 \\text{ Hz}$. Frecuencia angular $\\omega = 2\\pi f = 120\\pi \\approx 377 \\text{ rad/s}$.<br>
                    La posición desde el centro hasta los extremos es la Amplitud: $A = 65.00 \\text{ cm} = 0.65 \\text{ m}$.<br>
                    (a) Velocidad Máxima: $v_{max} = A\\omega = (0.65)(377) = \\mathbf{245 \\text{ m/s}}$.<br>
                    (b) Aceleración Máxima: $a_{max} = A\\omega^2 = (0.65)(377)^2 = \\mathbf{92,400 \\text{ m/s}^2}$.
                  </div>
                </div>
                <div class="sim-box">
                  <div class="piston-container">
                    <div class="piston-head"></div>
                    <div class="piston-rod"></div>
                  </div>
                </div>
              </div>

              <!-- Ejercicio 5 -->
              <div class="problem-statement-box" style="margin-top:20px;">
                <strong>Ejercicio 5: Cinemática Completa en $x$</strong><br>
                Una partícula en M.A.S. parte del origen en $t = 0$ moviéndose a la derecha. Amplitud $A = 2.00\\text{ cm}$, $f = 1.50\\text{ Hz}$. (a) Expresión $x(t)$. (b) Rapidez máxima. (c) Tiempo más temprano ($t>0$) para la rapidez máxima. (d) Aceleración máxima positiva. (e) Tiempo más temprano para la aceleración máxima positiva. (f) Distancia en $t = 1.00\\text{ s}$.
              </div>
              <div class="protocol-container">
                <div class="step-box step-4-resolucion">
                  <div class="step-header">Resolución Analítica</div>
                  <div style="font-size:0.84rem; color:var(--ink-secondary);">
                    $\\omega = 2\\pi f = 2\\pi(1.50) = 3.00\\pi \\approx 9.42 \\text{ rad/s}$. Como parte del origen a la derecha, la fase inicial es $0$ y usamos seno.<br>
                    (a) Expresión: $\\mathbf{x(t) = 2.00 \\sin(3.00\\pi t)}$ (en cm).<br>
                    (b) Rapidez Máxima: $v_{max} = A\\omega = 2.00(3.00\\pi) = \\mathbf{6.00\\pi \\text{ cm/s} \\approx 18.8 \\text{ cm/s}}$.<br>
                    (c) Tiempo rapidez máx: Ocurre al cruzar el equilibrio. La próxima vez es en medio período $t = T/2$. Como $T = 1/f = 0.667 \\text{ s}$, entonces $t = \\mathbf{0.333 \\text{ s}}$.<br>
                    (d) Aceleración Máxima Positiva: Ocurre en la máxima elongación negativa ($x = -A$). $a_{max} = A\\omega^2 = 2.00(3.00\\pi)^2 = \\mathbf{18.0\\pi^2 \\text{ cm/s}^2 \\approx 178 \\text{ cm/s}^2}$.<br>
                    (e) Tiempo $a_{max}$ positiva: Es al alcanzar $x = -A$, lo cual sucede en $t = 3T/4 = \\mathbf{0.500 \\text{ s}}$.<br>
                    (f) Distancia en $t = 1.00 \\text{ s}$: En $1.00 \\text{ s}$ completa exactamente $1.5$ ciclos ($1.00 / 0.667 = 1.5$). En un ciclo recorre $4A = 8.00 \\text{ cm}$, y en medio ciclo extra $2A = 4.00 \\text{ cm}$. Distancia total $= \\mathbf{12.0 \\text{ cm}}$.
                  </div>
                </div>
                <div class="sim-box">
                  <div class="axis-x">
                    <div class="origin-mark"></div>
                    <div class="particle-x"></div>
                  </div>
                </div>
              </div>

            </div>
            <div class="page-footer-note">
              <span class="page-footer-authors">Sara, Freiner y Daniela</span>
              <span>Cuaderno Digital Interactivo de Física 3</span>
            </div>
          </div>
        </section>

"""

# Insert the new page right before the old page 12 (which is now page 13)
content = content.replace(page_12_glosario_header_new, new_page_html + page_12_glosario_header_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Actualizacion completada exitosamente.")

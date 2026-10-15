# Moodboard → BeatMind

Lectura pieza por pieza de `assets/moodboard.png` y cómo se traduce en la app.

| Pieza del moodboard                                | Qué tomar                                                                            | Dónde se aplica en BeatMind                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Píldora con borde luminoso (arriba izquierda)      | Contorno de luz fino sobre negro                                                     | Chips «PASO N DE 7» / «ANTES DE EMPEZAR», foco de botones                         |
| Grilla en perspectiva violeta                      | Piso synthwave que se desvanece                                                      | Fondo `.guide-app::after` (muy tenue, no compite con el contenido)                |
| Landing «Elevate your business»                    | Horizonte de luz arriba, CTA píldora con glow, tarjetas oscuras con luz desde arriba | `--bm-horizon`, `.g-button.primary`, `--bm-glow-top` en `.lesson-card`            |
| Tarjetas «Intelligent Routing / Unified Dashboard» | Ícono en baldosa luminosa, resplandor violeta saliendo del borde superior            | `.intro-route` (íconos), `.beaty-card` (guía de Byte)                             |
| DAW móvil (Grand Piano, Steel Guitar…)             | Carriles por instrumento con color propio, play/record circular                      | Celdas `.learning-step` con `--sound-color`, `.g-listen-play` circular            |
| Slides «+31% / $17B / 37M+ / 01»                   | Números gigantes, tracking apretado, barras con una destacada brillante              | BPM en `.pulse-display`, onda de `.listen-bar`, numeración de pasos               |
| «You Get Paid. Or You Get Paid More.»              | Palabra clave en color dentro de un titular blanco; botón «SWIPE ↗» en píldora clara | Segunda línea de los h1 de la intro con `--bm-grad-accent-text`                   |
| Roadmap (Research → Improvements)                  | Pills con ícono en cuadrado violeta, la activa rellena                               | Stepper del recorrido, pestañas de ritmo (`.rhythm-tabs`)                         |
| Seda/cintas violetas, figura pixelada              | Atmósfera, materia luminosa                                                          | Reservado para ilustraciones o fondos de hero futuros (no usar detrás de texto)   |
| Logo «Ryze» (pulsador con dedo)                    | Símbolo dentro de una baldosa con glow                                               | Posible dirección para el logo — **decisión del usuario** (la mascota ya es Byte) |

## Paleta extraída

- Fondo: negro con tinte violeta (`#050409` – `#110e1a`).
- Acento: violeta eléctrico `#7442ff` con luces `#ab8eff` / `#cdbbff`.
- Secundarios puntuales del moodboard: azul eléctrico (Exness) → `--bm-blue`; naranja de la DAW → `--bm-ember` y el color de caja.
- Texto: blanco cálido `#f6f4ff`, grises lavanda para lo secundario.

## Tipografía

El moodboard usa sans geométricas de peso medio con tracking negativo en titulares grandes y mayúsculas espaciadas en etiquetas. Space Grotesk (titulares) + Inter (interfaz), ya incluidas, cubren esa voz. Cambiar de familia es una decisión de identidad del usuario.

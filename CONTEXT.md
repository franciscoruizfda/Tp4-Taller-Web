# BeatMind — contexto del proyecto

Estado al **15 de octubre de 2026**. Este documento sirve para retomar el trabajo en otra sesión sin perder decisiones. Distingue lo que pidió el usuario, lo que está hecho y lo que sigue abierto.

## Qué es y para qué

**BeatMind** es una aplicación web inspirada en FL Studio para que una persona **sin ninguna experiencia** componga su primer beat (una base musical corta que se repite), acompañada por un asistente de inteligencia artificial llamado **Byte**.

- Es un trabajo de la facultad (Taller 2, TP4). La referencia funcional original es `Funcionamiento-BeatMind.pdf`, que usa el nombre «Latido Studio».
- No busca copiar una DAW profesional: enseña el proceso paso a paso, con una sola tarea por pantalla, y deja que la persona decida escuchando.
- Se piensa como una **infografía interactiva**: más gráficos que texto.
- La van a usar **muchas personas distintas en la misma pantalla**, una detrás de otra (tipo muestra o instalación).
- Antes de usarla, al público se le explican las partes básicas de un beat y cómo puede ayudar una IA. La introducción de la app da contexto sin repetir esa enseñanza.

## Este repositorio: solo la app

Este repositorio (`github.com/franciscoruizfda/Tp4-Taller-Web`) tiene **solo la app BeatMind**, publicada sola en GitHub Pages para que el prototipo de Figma la abra con un link. La infografía completa pasada a web (portada, núcleos 1–3, trivia y gráfico) vive en otro repositorio, `github.com/franciscoruizfda/Tp4-Taller`; no mezclar los dos.

## Cómo funciona hoy

### Introducción (3 pantallas, aparece siempre al abrir o recargar)

1. **«Acá empieza tu primera base»**: qué se va a crear, con un ejemplo que se puede escuchar. Byte saluda: «¡Hola! Soy Byte.»
2. **«De a poco, y a tu manera»**: elegir un estilo → sumar sonidos → guardar la base. Byte: «Yo te acompaño en cada paso.»
3. **«Con Byte, vos decidís»**: Byte se presenta y promete no agregar sonidos sin preguntar.

Si ya había un beat empezado, la primera pantalla ofrece **Continuar mi beat** y **Reiniciar**.

### Los 7 pasos

La idea central: el beat son **16 casillas** que se recorren de izquierda a derecha y vuelven a empezar. Casilla encendida = el instrumento suena en ese momento. Cada instrumento tiene sus propias 16 casillas y todas suenan a la vez. Las casillas 1, 5, 9 y 13 marcan el pulso.

| Paso          | Qué hace la persona                                                                                               | Qué ofrece Byte                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1. Estilo     | Escucha ejemplos y elige Trap, Pop, Cumbia o Electrónica. Define velocidad inicial y notas.                       | Comentario                                                           |
| 2. Velocidad  | Ajusta los golpes por minuto con un control o marcando el pulso con clics.                                        | Comentario                                                           |
| 3. Ritmo      | Enciende casillas de bombo («pum»), caja («pa») y hi-hat («ts»), de a uno: «Siguiente» pasa de bombo a caja, a hi-hat y recién después al bajo. Mínimo una casilla. | Un patrón para el instrumento que se está viendo                     |
| 4. Bajo       | Opcional. Elige una de cinco notas y enciende casillas.                                                           | Un bajo que sigue al bombo (necesita que haya bombo)                 |
| 5. Melodía    | Opcional. Igual que el bajo, con notas más agudas.                                                                | Una melodía elegida según el ritmo                                        |
| 6. Equilibrio | Ajusta el volumen de cada instrumento o lo silencia.                                                              | Un equilibrio que baja los volúmenes altos y suaviza algunos sonidos |
| 7. Tu beat    | Le pone nombre y lo guarda como audio WAV (las 16 casillas repetidas 4 veces) o como proyecto editable.           | Felicitación                                                         |

Los pasos se desbloquean al avanzar y se puede volver a los ya visitados.

### Cómo propone Byte (regla central)

1. Byte **pregunta** si la persona quiere una idea.
2. Si acepta, prepara la propuesta **sin aplicarla**.
3. La persona puede escucharla con su beat y compararla con su versión.
4. Solo **«Sí, usar esta idea»** la aplica, y reemplaza únicamente ese instrumento. «No, seguir con mi versión» la descarta.

Escuchar, comparar o rechazar nunca modifica el beat guardado.

La tarjeta de Byte funciona como un chat: una sola frase en su globo y, dentro del mismo globo, las respuestas posibles como botones en fila (`replies` de `ByteSays`). No volver a separar los botones en columnas fuera del globo: el usuario lo encontró confuso.

### Pantalla

- **Header:** solo el logo y el nombre «beatmind.», centrados.
- **Pantalla ancha (desde 1400 px):** recorrido de pasos en vertical a la izquierda; a la derecha, una sola columna con el recuadro de trabajo y **Byte debajo**. Barra inferior fija con Volver · reproductor · Siguiente.
- **Pantallas medianas y celular:** recorrido horizontal arriba, recuadro, Byte debajo, reproductor y navegación al final.
- Al pie del recorrido (o al final de la página) están el indicador **Guardado** y el botón **Reiniciar**.

## Reglas del proyecto

Son pedidos expresos del usuario. No cambiarlas sin consultarle.

### Experiencia

- **Público principiante:** una tarea por pantalla, poco texto, decidir escuchando. No volver a una pantalla de estudio con todos los controles a la vista.
- **No calificar** la creatividad como correcta o incorrecta.
- **La introducción aparece siempre** al abrir o recargar. No ocultarla por haberla visto (ya pasó y el usuario lo reportó como error).
- **Consentimiento:** Byte no decide ni agrega sonidos sin aprobación explícita. Generar, escuchar, elegir y aceptar son acciones separadas. El teclado y los controles físicos pueden pedir una propuesta, nunca aceptarla.
- **Transparencia:** el motor de propuestas es local (patrones por género, bajo ligado al bombo, melodías con Markov). No describirlo como una IA entrenada ni como conectado a una API.

### Byte

- **Byte es el nombre y la mascota definitivos** (DJ violeta con auriculares de neón). Reemplazó al nombre provisional BEATY.
- **Está en todo el proceso**, de la introducción al final. Una pantalla nueva sin Byte está incompleta.
- **Se tiene que notar que le habla a la persona y la guía.** Todo lo que dice va en un globo de diálogo con el piquito apuntando hacia él, en primera persona y de vos.
- **Va debajo del recuadro de trabajo**, nunca al costado: es donde la gente espera encontrar a un asistente de IA.
- Cambia de pose y de frase según lo que pasa (al proponer, al ser rechazado, al terminar).

### Diseño

- **Estética «Neon Studio»**, tomada del moodboard del usuario: negro con tinte violeta, violeta eléctrico como único acento, brillo solo en lo importante, botones en píldora, grilla en perspectiva de fondo.
- **Paleta** (del segundo moodboard, `Imagenes/Moodboard-Visual-Taller.png`): principal `#6A00FF`, secundario `#A761C3` (orquídea, en degradés de títulos), fondo `#121212`, blanco y acento `#00FF99` (solo estados: guardado, checks). Vive en `src/theme/tokens.css`. Los colores de cada instrumento no cambiaron porque se guardan en el proyecto.
- **Es una infografía:** más íconos e ilustraciones que texto, y grandes. Cada paso tiene su ícono. No sumar bloques de texto sin apoyo gráfico.
- **Aprovechar el espacio:** el usuario trabaja en un monitor de ~1920 px. No dejar franjas vacías. En 1920×950 el recuadro de trabajo y la tarjeta de Byte deben verse sin scrollear.
- **Header solo con logo y nombre.** No sumarle botones ni textos.
- **Sin botones de Ayuda ni Opciones.** El usuario pidió eliminarlos; no reponerlos sin consultarle.
- **Reiniciar siempre visible**, y no deja rastros del beat anterior (tampoco en Deshacer).
- **«Ir a núcleo 3» arriba a la derecha de cada paso**, a la altura del título (en celular, en su propia fila debajo, también a la derecha). El usuario lo pidió a la derecha y bien visible: píldora con degradé orquídea → violeta, brillo, la línea «Seguí la infografía» y la flecha en un círculo blanco. Es orquídea a propósito, para que no se confunda con «Siguiente». La app es parte de la infografía interactiva del prototipo de Figma y el botón vuelve a ese prototipo, a la diapositiva del Núcleo 3. El destino es la constante `NEXT_NUCLEUS_URL` de `src/App.tsx`: el link de presentación del prototipo original (archivo `Qz1d1AwBF25vTohWgY3tLd`, frame `265-167`). Para que funcione, el prototipo tiene que estar compartido como «Anyone with the link can view». Si la constante se vacía, el botón se ve igual y Byte avisa que todavía no está listo.
- **Reproductor grande:** «Escuchá tu beat hasta acá» es la acción principal de cada paso.
- **Pestañas de instrumento y notas con aspecto de tecla:** Bombo, Caja y Hi-hat, y las notas de Bajo y Melodía, llevan el color de su instrumento, borde visible, letra grande y se levantan al pasar el mouse. El usuario pidió que se noten como botones; no volver a dejarlas como barras oscuras.

### Forma de trabajo

- **Responder siempre en español rioplatense**, cercano y sin exceso de detalle técnico. También está en `CLAUDE.md`.
- El usuario trabaja de forma iterativa: mira la versión y pide ajustes.
- **Logo, tipografías y nombre de marca siguen siendo propuestas.** La decisión es del usuario.
- Para cualquier cambio visual, usar la skill `beatmind-neon`.

## Cómo abrir y probar

Entorno original Windows: ahí usar `npm.cmd` y `npx.cmd` (PowerShell bloquea `npm` directo). En la Mac del usuario, `npm` y `npx` comunes. Las pruebas de interfaz piden Google Chrome (`channel: 'chrome'`); sin Chrome se pueden correr con el Chromium de Playwright quitando esa línea en una copia de la configuración.

```powershell
npm.cmd install
npm.cmd run start     # Vite + abre el navegador (Ctrl+Shift+B en VS Code). Recarga sola al guardar.
npm.cmd run build     # Compila a dist/
npm.cmd test          # 18 pruebas unitarias
npm.cmd run test:ui   # 5 pruebas de interfaz (Playwright con Chrome)
node .claude/skills/beatmind-neon/scripts/capture.mjs   # capturas en tmp/qa/neon/
```

- **Live Server:** abrir el `index.html` de la raíz. Redirige solo a `dist/index.html`. **Solo muestra cambios después de `npm.cmd run build`.** Es como lo abre el usuario.
- Los beats guardados con Live Server y con Vite no se comparten (el navegador los trata como sitios distintos).
- El script de capturas necesita el servidor de Vite activo en `http://127.0.0.1:5173/` (`npm.cmd run dev`). Saca la introducción, los 7 pasos y una propuesta en 1920×950, 1440×1000 y 390×844, sin tocar los guardados reales.
- La carpeta es un repositorio Git conectado a `github.com/franciscoruizfda/Tp4-Taller-Web` (rama `main`). Cada push a `main` publica la app en GitHub Pages: `https://franciscoruizfda.github.io/Tp4-Taller-Web/`.

## Estructura

Aplicación de navegador, sin backend, cuentas ni servicios externos. React + TypeScript + Vite.

| Archivo / carpeta                            | Contenido                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                                  | Instrucciones que se cargan solas en cada sesión (idioma, cómo abrir, skill).                                        |
| `CONTEXT.md`                                 | Este documento.                                                                                                      |
| `Funcionamiento-BeatMind.pdf`                | Referencia funcional original. No se modifica.                                                                       |
| `README.md`, `docs/`                         | Ejecución, alcance, experiencia guiada e identidad visual (incluye la tabla de poses de Byte).                       |
| `src/App.tsx`                                | Estado, navegación, reproducción, propuestas y consentimiento. Define `STEP_ICONS` y `ByteSays`.                     |
| `src/Introduction.tsx`                       | Las tres pantallas de introducción.                                                                                  |
| `src/Byte.tsx`, `src/assets/byte/`           | Componente de la mascota, 12 poses en WebP y la pose de cada paso (`PHASE_POSES`).                                   |
| `src/guide.ts`                               | Textos de los pasos, nombre del asistente (`ASSISTANT`), progreso y generación/aprobación de propuestas.             |
| `src/music.ts`, `src/audio.ts`               | Modelo musical, generación, síntesis, reproducción y exportación WAV.                                                |
| `src/hardware.ts`                            | Entrada por Serial (Arduino) y MIDI.                                                                                 |
| `src/guided.css`, `src/introduction.css`     | Layout: tamaños, espaciados y adaptación a cada ancho.                                                               |
| `src/theme/tokens.css`, `src/theme/neon.css` | Colores y brillos (únicos lugares con colores) y la «piel» visual. Quitar sus dos imports en `main.tsx` la revierte. |
| `src/styles.css`, `src/BrandView.tsx`        | Reset y restos del estudio original; vista de identidad (hoy sin acceso).                                            |
| `.claude/skills/beatmind-neon/`              | Skill de estética: reglas, recetas, lectura del moodboard y script de capturas.                                      |
| `.vscode/tasks.json`                         | Tarea `Ctrl+Shift+B` para abrir la app.                                                                              |
| `Mascota/`                                   | Originales de Byte (12 poses y 6 vistas, PNG). **No se modifican.**                                                  |
| `public/logo.svg`, `public/brand/`           | Logo provisional y tres propuestas (Onda / M, Pulso, Monograma).                                                     |
| `src/*.test.ts`, `tests/*.spec.ts`           | Pruebas unitarias y de interfaz.                                                                                     |
| `dist/`, `tmp/qa/`                           | Salida compilada (no editar) y capturas de revisión.                                                                 |

Datos técnicos que conviene respetar:

- **Proyecto versión 1:** nombre, género, BPM, swing, 5 pistas (`kick`, `snare`, `hat`, `bass`, `melody`) con 16 casillas, notas, volumen y silencio. Mantener compatibilidad con archivos `.beatmind.json`.
- **Guardado en el navegador:** `beatmind-project-v1` (beat) y `beatmind-guide-v1` (paso actual y pasos desbloqueados). No borrar `localStorage` para forzar una pantalla.
- `makeGuidedProject()` crea un proyecto vacío; `makeProject()` trae patrones y se usa para ejemplos. No confundirlos.
- Los colores de instrumento están en `music.ts` y se guardan en el proyecto: no cambiarlos ahí.
- Las pruebas buscan botones y títulos por su texto. Al restilizar, no cambiar esos textos.
- **Escala automática (`src/fit.ts`):** el diseño ancho está pensado para 1920×950. Si la ventana es más grande (pantalla mayor, o zoom del navegador por debajo de 100 %), toda la página se agranda con `zoom` para seguir llenando la pantalla. Por eso en los CSS no se usan `vw`/`vh` directos sino `var(--bm-vw)` y `var(--bm-vh)`.
- **Controles físicos:** Serial a 115200 baud con JSON por línea; MIDI con pads 36/38/42; Gamepad. El protocolo está en `README.md`. Nunca se probó con dispositivos reales.

## Qué se hizo en esta etapa (9 y 10 de octubre de 2026)

El proyecto venía de una sesión anterior con el recorrido guiado ya funcionando. En esta se trabajó sobre todo la estética y la experiencia:

1. **Estética Neon Studio.** El usuario aportó un moodboard. Se creó la skill `beatmind-neon` y se aplicó el estilo a toda la app.
2. **Live Server.** La página quedaba en blanco porque Live Server no puede leer React/TypeScript. Ahora `index.html` redirige a la versión compilada.
3. **Uso del espacio.** En pantallas anchas el contenido pasó de 1160 a 1720 px, con recorrido lateral y barra inferior fija. Introducción a dos columnas.
4. **Byte.** Reemplazó a BEATY y a la carita provisional, con una pose por momento.
5. **Escala de infografía.** Ícono propio por paso y gráficos más grandes.
6. **Byte habla.** Sus mensajes pasaron a globos de diálogo en primera persona; los avisos llevan su cara.
7. **Header.** Quedó solo el logo y el nombre, centrados.
8. **Ayuda y Opciones eliminados**, a pedido del usuario.
9. **Reiniciar.** Botón siempre visible, con confirmación, que también vacía Deshacer.
10. **Reproductor más grande.**
11. **Byte debajo del recuadro.** Para que entre a la vista se compactaron los pasos: 16 casillas en una fila, Velocidad con el medidor a la izquierda, Equilibrio con los 5 instrumentos en fila. Se eliminó la frase «Te propongo. Vos decidís.»

Última verificación: compila y pasan las 18 pruebas unitarias y las 5 de interfaz.

## Funciones que quedaron sin acceso

Al eliminar Ayuda y Opciones, estas funciones siguen en el código (`App.tsx`, diálogos `help` y `settings`) pero no hay botón que las abra:

- **Abrir un proyecto guardado** (`.beatmind.json`). El botón «Guardar proyecto para seguir editando» del último paso sigue existiendo, pero ese archivo hoy no se puede volver a abrir.
- **Conectar controles físicos** (Arduino / Serial y MIDI).
- **Repetir la introducción sin recargar.**
- **Vista de identidad visual** (paleta, tipografías y los tres logos).
- **Texto de ayuda** con los atajos de teclado. Los atajos siguen funcionando: Espacio (escuchar), T (marcar pulso), I (pedir idea), 1/2/3 (pads).

## Próximos pasos

### Decisiones que esperan al usuario

1. **Abrir proyecto:** darle un lugar (por ejemplo, un enlace en la primera pantalla) o quitar también «Guardar proyecto para seguir editando».
2. **Controles físicos:** si el trabajo va a usar Arduino, hace falta un acceso para conectarlo.
3. **Explicaciones de Ritmo, Bajo y Melodía:** siguen con voz neutra («El golpe profundo: pum»). Se ofreció pasarlas a la voz de Byte.
4. **Gráficos achicados:** al bajar a Byte se redujeron las onomatopeyas, las ilustraciones de estilo, bajo y melodía, y el Byte de la pantalla final. Revisar si alguno quedó chico.
5. **Reinicio:** hoy pide confirmación (dos clics). Opciones ofrecidas: un solo clic, o reinicio automático tras unos minutos sin uso.
6. **Logo:** sigue el lila plano, que desentona con el violeta nuevo. Podría rediseñarse en torno a Byte.
7. **Paso de Equilibrio:** es el que menos gráfico tiene. Se ofreció sumar un ícono por instrumento.

### Mejoras detectadas

- **Hacer más claro el recorrido desde el paso 3.** El propio usuario dejó de entenderlo ahí. La app nunca muestra las filas de instrumentos juntas ni explica con un dibujo que las casillas son tiempo que se repite. Es la mejora de más impacto para el público principiante.
- **Tamaño de texto:** quedan etiquetas de 8 a 10 px, difíciles de leer en proyector.
- **Probar con principiantes reales** la comprensión de casillas, pulso, bajo, melodía y volúmenes.
- **Poses de Byte sin usar:** vistas de frente, perfil, tres cuartos y espalda.

### Más adelante (del plan original, sin fecha)

- Definir el entorno final: navegador local, instalación o web pública.
- Decidir si se conecta un modelo generativo real (proveedor, costos, privacidad), manteniendo el flujo de consentimiento.
- Definir y probar el hardware: Arduino, cableado, firmware, latencia.
- Trivia humano/IA del PDF, cuando haya audios con licencia verificada.
- Ampliaciones musicales: varios patrones, arreglo con secciones, duración de notas, exportación MIDI.
- Cerrar nombre de marca, tipografías y paleta final.

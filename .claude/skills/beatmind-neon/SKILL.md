---
name: beatmind-neon
description: Aplica la estética «Neon Studio» de BeatMind (negro profundo, violeta eléctrico, brillos, vidrio, píldoras, grilla en perspectiva) a pantallas o componentes de la web. Usala cuando el usuario pida mejorar la estética, adaptar algo al moodboard, «que se vea como el moodboard», crear o rediseñar un componente/pantalla visual, o revisar si una vista respeta el estilo. Incluye tokens, recetas de componentes, reglas del proyecto y un script de capturas para verificar escritorio y móvil.
---

# BeatMind · Neon Studio

Estética derivada del moodboard del usuario (`assets/moodboard.png`). Miralo antes de diseñar algo nuevo. El detalle de cada pieza del moodboard está en `references/moodboard.md`.

**Estado:** dirección visual elegida por el usuario para explorar. Nombre, logo, mascota y paleta final siguen siendo decisiones del usuario: no los cambies por tu cuenta, proponé.

## Arquitectura de estilos (respetala siempre)

| Archivo                                  | Qué va ahí                                                                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/theme/tokens.css`                   | **Única fuente** de colores, gradientes, brillos, radios, tipografía y movimiento (`--bm-*`).                                                                          |
| `src/theme/neon.css`                     | **Piel**: solo propiedades visuales (color, fondo, borde, sombra, radio, tracking). Se carga al final (`main.tsx`), así que gana por orden con la misma especificidad. |
| `src/guided.css`, `src/introduction.css` | **Layout**: tamaños, espaciados, grillas, responsive.                                                                                                                  |
| `src/styles.css`                         | Reset global + estilos del estudio original (muchos sin uso; no limpiar sin motivo).                                                                                   |

Reglas:

1. **Nunca hex sueltos en componentes.** Si falta un color, agregá un token en `tokens.css`. Alfas puntuales `rgb(106 0 255 / x)` del violeta-500 o `rgb(0 255 153 / x)` del verde acento están permitidos para fondos tenues.
2. **Piel ≠ layout.** Un cambio estético va en `neon.css`; si hace falta mover/espaciar, va en el CSS de layout. No mezclar.
3. Para pisar una regla de layout que define color, usá **el mismo selector** en `neon.css` (misma especificidad + orden posterior). Si la original tiene más especificidad (ej. `.intro-route > div:nth-of-type(2) > span`), repetí ese selector.
4. Los colores de instrumentos vienen de `src/music.ts` y **se guardan en el proyecto** (`track.color`). No los cambies ahí; en CSS usá `var(--sound-color)` (inyectado inline) o los tokens espejo `--bm-kick/snare/hat/bass/melody`.
5. Revertir la estética = quitar los dos imports de `src/main.tsx`.

## Uso del espacio (layout por tamaño de pantalla)

El usuario trabaja en un monitor de ~1920 px: **diseñá primero para ancho y verificá que no sobre espacio**. Sobra ancho y suele faltar alto, así que la regla es reorganizar, no solo agrandar.

| Ancho       | Introducción                                                                                            | Pasos                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 1400 px   | Dos columnas a pantalla completa: texto grande a la izquierda, ilustración a la derecha (desde 1100 px) | **Recorrido vertical** a la izquierda (`.guide-rail`) y, a la derecha, una sola columna: recuadro de trabajo y **Byte debajo**. **Barra inferior fija** (`.lesson-footer`) con Volver · reproductor · Siguiente |
| 820–1400 px | Columna centrada                                                                                        | Recorrido horizontal arriba, trabajo y Byte debajo, reproductor y navegación al pie (sin fijar)                                                                                                                 |
| < 820 px    | Columna centrada                                                                                        | Una columna; Byte debajo del trabajo                                                                                                                                                                            |

Reglas:

- **Byte va siempre debajo del recuadro de trabajo**, nunca al costado (pedido del usuario: es donde la gente espera encontrar a un asistente de IA). En 1920×950 su tarjeta tiene que verse completa arriba de la barra inferior, también con una propuesta abierta: si un paso crece, compactá el recuadro usando el ancho (casillas en una fila, controles lado a lado).
- Los avisos (`.g-toast`) van arriba a la derecha en ancho, para no tapar a Byte.
- **El header lleva solo el logo y el nombre, centrados** (pedido del usuario). No sumarle botones, textos ni estados. Los botones de Ayuda y Opciones se eliminaron a pedido del usuario: no volver a agregarlos sin consultarle. El indicador de guardado y el botón **Reiniciar** (obligatorio: la pantalla la comparten muchas personas) viven en `.guide-tools` (al pie del recorrido lateral en ancho, al final de la página en el resto).
- Ancho máximo del contenido: **1720 px**, con 48 px de margen. El header usa el mismo cálculo para quedar alineado.
- En ancho, **la tarea principal del paso + la barra inferior deben entrar sin scrollear** en 1920×950. Lo plegado («Un poco más sobre este paso») puede quedar debajo.
- El reproductor (`.listen-bar`) vive dentro de `.lesson-footer`. No lo dupliques en las tarjetas.
- Lo que se queda fijo al scrollear (`position: sticky`) va condicionado a la altura (`min-height: 900px`) para no tapar contenido en notebooks bajas.
- Al sumar contenido a una pantalla, usá primero el ancho libre (más columnas, como los 4 estilos en fila desde 1700 px) antes que el alto.

## Es una infografía: más gráficos que texto

Pedido explícito del usuario: **tiene que haber más íconos e ilustraciones que texto, y a gran tamaño.**

- **Cada paso tiene su ícono** (`STEP_ICONS` en `src/App.tsx`): aparece en el recorrido y, en baldosa luminosa, junto al título (`.lesson-icon`). Un paso o sección nueva necesita su ícono.
- **Nada de bloques de texto sin apoyo gráfico.** Si sumás una explicación, acompañala con un ícono en baldosa, una ilustración o a Byte.
- Tamaños de referencia en ancho: ícono de paso 92 px, ícono de tarea 48 px, onomatopeya (`.sound-word`) 112 px, medidor de velocidad 290 px, Byte en el guía 204 px, Byte en la introducción ~270–300 px.
- Para agrandar ilustraciones hechas con formas CSS usá `zoom` en el elemento (ver `.style-visual > i`, `.notes-illustration`); verificá que no se recorten dentro de su tarjeta.
- Toda la escala vive en un solo bloque al final de `src/guided.css` («Infographic scale»): base, ancho y angosto.
- No se trata de borrar textos (las pruebas y la pedagogía los necesitan), sino de que el gráfico sea lo primero que se ve.

## Byte, la mascota

Byte es la IA que acompaña al usuario (DJ violeta con auriculares de neón). **Decisión del usuario: debe estar en todo el proceso**, desde la introducción hasta el final.

- Componente: `<Byte pose="…" />` (`src/Byte.tsx`). Poses: `hola`, `idea`, `presenta`, `senala`, `camina`, `tranqui`, `mezcla`, `baila`, `aplaude`, `festeja`, `agachado`, `frente`.
- Una pose por paso en `PHASE_POSES`; al proponer una idea usa `presenta` y si el usuario la rechaza, `tranqui`. La tabla completa está en `docs/identidad-visual.md`.
- Elegí la pose por lo que significa (señalar para elegir, agachado para el bajo, consola para mezclar). No repitas la misma pose dos veces en una pantalla.
- Los originales viven en `Mascota/` y **no se tocan**. La app usa copias WebP recortadas en `src/assets/byte/`. Para sumar una pose: recortar/convertir y agregarla al mapa de `Byte.tsx`.
- Byte ya es violeta con brillo propio: solo lleva un `drop-shadow` suave (`.byte` en `neon.css`). No le pongas marcos, fondos opacos ni filtros de color.
- Es decorativo para lectores de pantalla (`alt=""`): el nombre «Byte» siempre va también como texto.
- Una pantalla nueva sin Byte está incompleta.

### Byte habla: es el guía, no un adorno

Pedido explícito del usuario: **tiene que notarse que Byte le habla al usuario** y que lo guía en todo el proceso.

- **Todo lo que dice Byte va en un globo de diálogo con «piquito» apuntando hacia él.** Nunca texto suelto al lado de la figura.
  - Mensaje del guía (título + frase): `<ByteSays title="…">…</ByteSays>` en `src/App.tsx`.
  - Frase corta junto a una figura: `<span className="byte-bubble tail-left">` (o `tail-right`, según de qué lado esté Byte).
- **Habla en primera persona y de vos**, corto y cálido: «¡Hola! Soy Byte.», «Yo te acompaño en cada paso.», «Si querés, te muestro otra.». Nada de voz neutra del sistema («El estilo ajusta…»).
- **Reacciona a lo que hace el usuario:** cambia de pose y de frase al proponer, al ser rechazado y al terminar.
- Los avisos (`.g-toast`) llevan su cara (`.byte-avatar`) porque están escritos con su voz.
- Si movés a Byte de lugar en algún tamaño de pantalla, mové también el piquito del globo (ver los `::before` en el bloque «Byte speaks» de `guided.css`).
- Al agregar un globo junto a una figura con `zoom`, comprobá que no se salga de la pantalla en anchos intermedios (1100, 1280, 1536), no solo en 1920.
- Movimiento: el globo entra con un «pop» y Byte flota apenas; ambos solo con `prefers-reduced-motion: no-preference`.
- No tocar los textos de los botones ni la lógica: Byte pregunta, el usuario decide.

## Los 7 principios del moodboard

1. **Negro con tinte violeta, no gris.** Fondos `--bm-bg` / `--bm-surface*`. La profundidad viene de la luz, no de grises.
2. **Un solo acento: violeta eléctrico.** Gradiente `--bm-grad-primary` para la acción principal. La menta queda solo para estado/seguridad (guardado, consentimiento, check). Ember (`--bm-ember`) solo para «grabando/en vivo» si algún día existe.
3. **La luz cuenta la jerarquía.** Lo importante brilla (`--bm-glow-*`), lo secundario es vidrio (`--bm-grad-glass` + `--bm-line`). Máximo **un elemento con glow fuerte por zona** de la pantalla.
4. **Resplandor desde arriba.** Tarjetas con `--bm-glow-top` (luz que cae desde el borde superior) y el horizonte `--bm-horizon` de fondo.
5. **Formas redondas.** Botones y chips en píldora (`--bm-r-pill`), tarjetas `--bm-r-lg`, celdas `12px`, botón de play circular.
6. **Titulares grandes, tracking apretado, gradiente sutil.** `--bm-grad-text` en h1; una palabra clave puede ir con `--bm-grad-accent-text` (como «Paid.» o «Funds» en el moodboard).
7. **Los instrumentos son los carriles de color** (como la DAW del moodboard): el único lugar multicolor, siempre con su brillo `color-mix(... var(--sound-color) ...)`.

## Recetas

```css
/* Tarjeta base (vidrio con luz desde arriba) */
.x {
  background: var(--bm-glow-top), var(--bm-surface);
  border: 1px solid var(--bm-line);
  border-radius: var(--bm-r-lg);
  box-shadow: var(--bm-highlight), var(--bm-drop);
}

/* Tarjeta protagonista (guía de Byte, propuesta destacada) */
.x {
  background:
    radial-gradient(110% 55% at 50% 0%, rgb(116 66 255 / 0.36), transparent 70%),
    linear-gradient(180deg, var(--bm-surface-3), var(--bm-surface) 70%);
  border: 1px solid var(--bm-line-violet);
  border-radius: var(--bm-r-lg);
  box-shadow:
    var(--bm-highlight),
    0 30px 80px -30px rgb(116 66 255 / 0.5);
}

/* Botón primario */
.x {
  background: var(--bm-grad-primary);
  color: var(--bm-on-violet);
  border-radius: var(--bm-r-pill);
  box-shadow: var(--bm-highlight), var(--bm-glow-sm);
}
.x:hover:not(:disabled) {
  box-shadow: var(--bm-highlight), var(--bm-glow-md);
}

/* Botón secundario (vidrio) */
.x {
  background: var(--bm-grad-glass), var(--bm-surface-2);
  border: 1px solid var(--bm-line-strong);
  color: var(--bm-violet-50);
  border-radius: var(--bm-r-pill);
}

/* Chip / eyebrow con punto luminoso («PASO 3 DE 7») */
.x {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid var(--bm-line-violet);
  border-radius: var(--bm-r-pill);
  background: rgb(116 66 255 / 0.1);
  color: var(--bm-violet-200);
  font-weight: 600;
  letter-spacing: var(--bm-track-label);
}
.x::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bm-violet-300);
  box-shadow: 0 0 10px var(--bm-violet-400);
}

/* Titular con gradiente */
.x {
  background: var(--bm-grad-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: var(--bm-track-display);
}

/* Ícono en baldosa luminosa (como «Intelligent Routing») */
.x {
  background: radial-gradient(circle at 50% 0%, rgb(116 66 255 / 0.55), var(--bm-surface-2) 72%);
  border: 1px solid var(--bm-line-violet);
  color: var(--bm-violet-50);
  box-shadow: var(--bm-highlight), var(--bm-glow-md);
}

/* Celda de instrumento encendida (requiere --sound-color en un ancestro) */
.x.on {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--sound-color) 45%, var(--bm-surface-2)),
    color-mix(in srgb, var(--sound-color) 14%, var(--bm-surface))
  );
  border-color: var(--sound-color);
  box-shadow:
    var(--bm-highlight),
    0 10px 28px -8px color-mix(in srgb, var(--sound-color) 70%, transparent);
}

/* Número grande (BPM, contadores) */
.x {
  font-family: var(--bm-font-display);
  color: var(--bm-text);
  letter-spacing: var(--bm-track-display);
  text-shadow: 0 0 30px rgb(143 102 255 / 0.7);
}
```

Si un componente nuevo necesita el color de su instrumento, pasalo inline desde React: `style={{ '--sound-color': track.color } as CSSProperties}`.

## Flujo de trabajo

1. **Ubicá** la pantalla/componente en `src/App.tsx` o `src/Introduction.tsx` y sus clases en el CSS de layout.
2. **Elegí la receta** según el rol: ¿acción principal, contenedor, protagonista, estado, instrumento?
3. **Escribí la piel** en `neon.css`, en la sección que corresponda (están separadas por comentarios `── Nombre ──`). Solo tokens.
4. **Si cambia el layout** (o el tracking/tamaño de letra), revisá el responsive en `guided.css`. Ojo: el tracking apretado cambia anchos y puede alterar cómo envuelven los flex (pasó con `.sound-introduction`; se resolvió con `flex: 1 1 200px`).
5. **Verificá** (ver abajo) y mirá las capturas, sobre todo móvil.
6. Si tomaste una decisión de estilo relevante, anotala en `docs/identidad-visual.md` y/o `CONTEXT.md`.

## Restricciones del proyecto (no negociables)

- **No cambiar textos ni roles accesibles** al restilizar: las pruebas de Playwright buscan por texto y rol (`getByRole`, `getByText`). La clase `.pulse-display` también se usa en una prueba.
- **No tocar la lógica** de consentimiento de Byte, propuestas, persistencia ni la introducción siempre visible. Esto es solo estética.
- **Contraste:** texto principal `--bm-text`, secundario `--bm-text-2`, terciario `--bm-text-3` solo para etiquetas. Nunca texto violeta oscuro sobre violeta. El público es principiante y puede verse en proyector.
- **Estado nunca solo por color:** mantener íconos/textos (check, candado, «En silencio»).
- **Movimiento:** cualquier animación nueva va dentro de `@media (prefers-reduced-motion: no-preference)` o queda anulada por el bloque `reduce` existente.
- **Rendimiento:** `backdrop-filter` solo en header, modal, toast y la barra inferior fija. No apilar glows animados.
- **Identidad:** Byte (nombre y mascota) está definido por el usuario. El logo (`public/logo.svg`), las fuentes y el nombre de marca siguen siendo propuestas. Podés sugerir variantes acordes al moodboard, no reemplazarlas sin aprobación.

## Verificación

Desde la raíz (Windows: usar `npm.cmd`):

```powershell
npm.cmd run build          # TypeScript + bundle
npm.cmd test               # 18 pruebas unitarias
npm.cmd run test:ui        # pruebas de interfaz (reutiliza el servidor si está activo)
node .claude/skills/beatmind-neon/scripts/capture.mjs   # capturas en tmp/qa/neon/
```

El script necesita el servidor de desarrollo (`npm.cmd run dev`, `http://127.0.0.1:5173/`). Usa un perfil de navegador aislado y carga un beat de demostración, así que no toca los guardados reales. Genera intro (3), las 7 fases y la propuesta de ritmo en tres tamaños: `wide` 1920×950 (solo lo visible sin scrollear, para juzgar el uso del espacio), `desktop` 1440×1000 y `mobile` 390×844 (página completa). Opciones: `--url`, `--out` y `--only wide,mobile`.

Nota: en capturas de página completa los elementos `position: fixed` del fondo (horizonte y grilla) pueden dejar una línea horizontal al final; no aparece al usar la app.

## Checklist antes de dar por terminado

- [ ] Ningún hex nuevo fuera de `tokens.css` (`grep -n "#[0-9a-fA-F]\{3,6\}" src/theme/neon.css` solo debería mostrar comentarios).
- [ ] Un solo foco de brillo fuerte por zona; el botón primario es lo más luminoso de su área.
- [ ] Botones y chips en píldora; tarjetas con radio grande.
- [ ] En `wide` no sobran franjas vacías y la tarea principal entra sin scrollear.
- [ ] Byte está presente y el gráfico pesa más que el texto en la pantalla.
- [ ] Legible en móvil 390 px y sin desbordes horizontales.
- [ ] Build y pruebas pasan; capturas revisadas.

## Antipatrones

- Glow en todo: si todo brilla, nada destaca.
- Grises neutros (`#222`, `#333`) en vez de superficies con tinte violeta.
- Gradientes multicolor (arcoíris) fuera de los carriles de instrumentos.
- Texto chico gris sobre vidrio: subí a `--bm-text-2` o agrandá.
- Copiar la complejidad visual de un dashboard: BeatMind sigue siendo una tarea por pantalla.

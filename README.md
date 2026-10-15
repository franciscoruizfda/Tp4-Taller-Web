# BeatMind

Un recorrido para aprender a crear una primera base musical, acompañado por **Byte**. Pensado para personas que nunca usaron una DAW ni compusieron un beat. Basado en [Funcionamiento-BeatMind.pdf](./Funcionamiento-BeatMind.pdf), cuyo nombre original es «Latido Studio».

## Ejecutar

Necesitás Node.js 22.12 o posterior. El entorno de desarrollo usado tiene Node 24.

```powershell
npm.cmd install
npm.cmd run dev
```

Abrí la dirección que muestra Vite, normalmente `http://127.0.0.1:5173`. En Windows se usa `npm.cmd` para evitar restricciones sobre scripts de PowerShell. No necesitás claves de API.

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:ui
npm.cmd run preview
```

## Un paso a la vez

Antes del recorrido, una introducción de tres pantallas presenta qué vas a crear, cómo avanzarás y cómo te acompaña Byte. Parte de los conceptos aprendidos previamente, sin repetir toda la explicación de las partes de un beat. Incluye un ejemplo de audio opcional que no modifica el proyecto.

Después se abre un recorrido con una sola tarea visible por pantalla y explicaciones adicionales plegadas:

1. **Estilo:** escuchar ejemplos de Trap, Pop, Cumbia y Electrónica. La elección se confirma al seguir; escuchar o seleccionar una tarjeta todavía no modifica el proyecto.
2. **Velocidad:** aprender qué es un pulso, escucharlo, mover un control simple o marcarlo con la mano.
3. **Ritmo:** conocer bombo, caja y hi-hat por separado. Encender casillas para formar un patrón de 16 momentos que se repite.
4. **Bajo:** escuchar una propuesta o crear una línea manual. Se puede continuar sin bajo.
5. **Melodía:** comparar tres ideas o probar notas manualmente. Se puede continuar sin melodía.
6. **Equilibrio:** escuchar todas las capas y ajustar sus volúmenes. Byte puede proponer una limpieza de la mezcla.
7. **Tu beat:** ponerle nombre, escuchar el resultado y guardar audio o proyecto editable.

Las siguientes etapas se habilitan al avanzar. Se puede regresar a cualquier paso ya abierto. La guía no permite avanzar sin elegir un estilo ni sin agregar algún golpe de percusión; los acompañamientos son opcionales. El estado de las casillas no se evalúa como «correcto» o «incorrecto».

Los proyectos nuevos empiezan sin instrumentos agregados. Se conservan los proyectos de la primera versión. La introducción aparece al entrar a la aplicación. Si ya empezaste el recorrido, **Continuar mi beat** permite retomar directamente el paso guardado. También se puede repetir desde **Opciones → Ver introducción**, conservando el proyecto y el paso actual. Cambiar de estilo conserva los golpes y volúmenes existentes, ajusta el tempo y transpone bajo/melodía a la nueva escala; el texto explica este cambio antes de confirmarlo.

## Byte propone, el usuario decide

Cada ayuda sigue este flujo:

1. Byte pregunta si querés ver una idea.
2. **«Sí, mostrame una idea»** prepara una propuesta separada del proyecto actual.
3. Podés escuchar la propuesta, comparar tu versión y elegir una de las tres melodías.
4. **«Sí, usar esta idea»** incorpora los cambios descritos. **«No, seguir con mi versión»** descarta la propuesta.

Preparar, escuchar, comparar y rechazar no modifica el proyecto ni su guardado. Mientras haya una propuesta abierta, hay que decidir aceptarla o descartarla para avanzar. Una edición manual invalida la propuesta anterior; también se verifica que la propuesta se haya generado para la versión actual antes de aceptarla. El teclado, Arduino y joystick pueden pedir propuestas, pero no aprobarlas.

El nombre está centralizado en `ASSISTANT`, en `src/guide.ts`. Byte es la mascota definida por el usuario: sus poses están en `src/assets/byte/` (copias optimizadas de `Mascota/`) y se eligen por paso en `src/Byte.tsx`. El motor de propuestas se podrá sustituir más adelante.

## Guardado y sonido

- Deshacer hasta 20 cambios. El guardado automático conserva un proyecto y el avance del recorrido en este navegador.
- Los archivos `.beatmind.json` conservan el formato anterior y permiten continuar en otro equipo. Al abrir uno, se habilitan los pasos para editarlo.
- WAV estéreo PCM, 44.1 kHz y 16 bits: cuatro repeticiones del patrón, más una cola de 0.6 segundos. Todavía no hay arreglo de canción con varias secciones.
- Síntesis con Web Audio, sin samples externos.
- La limpieza propuesta es una receta DSP: reduce volúmenes altos, aplica un filtro pasa altos en caja, hi-hat y melodía, y suaviza el ataque del bajo. No es un análisis automático de conflictos de frecuencia.
- Identidad visual, archivos y conexiones se encuentran en **Opciones**. Los ajustes de hardware están plegados para simplificar la experiencia inicial.

## Asistencia musical

El PDF permite cadenas de Markov locales como alternativa a APIs generativas. El motor actual utiliza una cadena de primer orden con probabilidades definidas manualmente para transiciones entre grados de la escala. El bajo sigue el bombo; las propuestas de percusión usan patrones por género y por instrumento. No hay un modelo entrenado ni llamadas a un proveedor de IA en la nube. Todas las propuestas requieren una aceptación explícita para modificar el proyecto.

Este motor funciona como base para validar la experiencia. Podemos sustituir el generador melódico por un modelo MIDI cuando definamos requisitos, proveedor, privacidad y costos. No deben ponerse claves de API en el frontend.

## Controles

Atajos fuera de botones, campos de texto y menús. Funcionan solo en las etapas correspondientes:

| Entrada | Acción                                                                  |
| ------- | ----------------------------------------------------------------------- |
| Espacio | Escuchar / detener; vuelve al inicio del patrón                         |
| T       | Marcar el pulso en Velocidad: al menos tres golpes                      |
| 1, 2, 3 | Pads de bombo, caja y hi-hat en Ritmo                                   |
| I       | Pedir propuestas en Ritmo, Bajo, Melodía o Equilibrio; nunca aceptarlas |

La entrada en vivo se alinea al paso actual del reloj; todavía no usa un historial de timestamps para elegir el paso más cercano.

### Arduino / Serial

Menú **Opciones → Conectar controles físicos → Conectar Arduino / Serial**. El navegador pide elegir un puerto. Comunicación a **115200 baud**, JSON UTF-8 terminado en salto de línea. Chrome/Edge en localhost son la referencia inicial. No se necesita configurar puertos para usar el recorrido con mouse.

```json
{"type":"bpm","value":512}
{"type":"tap"}
{"type":"pad","track":"kick"}
{"type":"note","note":45,"velocity":100}
{"type":"volume","track":"bass","value":96}
{"type":"assist"}
```

`bpm.value` representa el potenciómetro 0–1023 y se convierte a 40–200 BPM. `volume.value` es 0–127. Pistas: `kick`, `snare`, `hat`, `bass`, `melody`. Cada entrada solo actúa en su fase: BPM/tap en Velocidad; pads en Ritmo; notas en Bajo/Melodía; faders en Equilibrio. Las notas se ajustan a la nota más cercana dentro de la escala. Los mensajes inválidos se ignoran. El firmware Arduino queda pendiente del cableado y componentes reales.

### MIDI y joystick

MIDI USB: notas 36/38/42 disparan pads; las demás notas válidas disparan bajo o melodía. CC 20–24 controlan los cinco volúmenes; CC 1 controla BPM. La versión inicial usa sonidos cortos, sin sostén por Note Off. Habilitar MIDI requiere permiso del navegador.

Gamepad: eje X navega entre etapas ya habilitadas, botón 0 reproduce y botón 1 pide propuestas. Ningún botón aplica automáticamente las sugerencias. El dispositivo debe aparecer en `navigator.getGamepads()`; algunos necesitan una primera pulsación para ser detectados. No se implementó navegación libre del cursor, arrastrar bloques ni pulsación larga. El mapeo Bluetooth debe verificarse con tu joystick.

**Las integraciones físicas no fueron probadas con un Arduino o joystick real.**

## Estructura

| Archivo                    | Responsabilidad                                              |
| -------------------------- | ------------------------------------------------------------ |
| `src/music.ts`             | Proyecto, géneros, restricciones musicales y generación      |
| `src/audio.ts`             | Reloj de audio, síntesis, mezcla y WAV                       |
| `src/hardware.ts`          | Adaptadores Serial y MIDI                                    |
| `src/App.tsx`              | Recorrido, escucha, interacción manual y consentimiento      |
| `src/Introduction.tsx`     | Contexto previo al recorrido, ejemplo y presentación de Byte |
| `src/introduction.css`     | Diseño de las tres pantallas introductorias                  |
| `src/guide.ts`             | Lecciones, identidad de Byte, progreso y propuestas          |
| `src/guided.css`           | Interfaz del recorrido, accesibilidad y adaptación móvil     |
| `src/BrandView.tsx`        | Vista independiente de identidad visual                      |
| `src/files.ts`             | Descargas de audio, proyectos y símbolos                     |
| `src/styles.css`           | Estilos compartidos y vista de identidad                     |
| `docs/alcance.md`          | Correspondencia con PDF y próximas etapas                    |
| `docs/identidad-visual.md` | Propuesta de marca pendiente de decisión                     |

## Referencias técnicas

- [Vite: instalación y versiones de Node](https://vite.dev/guide/)
- [MDN: OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/OfflineAudioContext)
- [MDN: Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [MDN: Web MIDI](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [Fontsource: fuentes locales](https://fontsource.org/docs/getting-started/install)

Las fuentes incluyen sus licencias dentro de los paquetes `@fontsource`. El PDF original se conserva sin cambios.

Las pruebas de interfaz usan Chrome instalado y un servidor local de Vite (lo inician si hace falta). Si no tenés Chrome, cambiá `channel` en `playwright.config.ts` o instalá Chromium de Playwright.

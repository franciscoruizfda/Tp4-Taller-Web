# Experiencia guiada y consentimiento de Byte

## Objetivo

Una persona sin experiencia debe comprender qué está agregando a su beat y tomar decisiones con el oído. Cada pantalla enseña un solo concepto y ofrece una tarea concreta. No se muestran un secuenciador completo, una consola y múltiples paneles a la vez.

Antes de crear, una introducción de tres pantallas da contexto: una base propia, un recorrido de elegir/escuchar/probar y Byte como acompañante que pregunta antes de agregar sonidos. Asume que el usuario ya recibió una explicación básica de beat e IA. Ofrece escuchar un ejemplo independiente del proyecto, sin agregarlo. Solo muestra una idea principal por pantalla.

Los pasos son: Estilo, Velocidad, Ritmo, Bajo, Melodía, Equilibrio y Tu beat. La percusión se aprende instrumento por instrumento; bajo y melodía se pueden omitir. El texto principal es breve y orientado a la acción. Cada paso incluye una explicación adicional plegada y permite escuchar el proyecto acumulado.

## Reglas de Byte

- No genera acompañamientos al cambiar de fase.
- Pregunta antes de preparar una idea. La entrada de asistencia del hardware equivale a pedir una propuesta.
- Una propuesta vive en un objeto independiente del proyecto. El autoguardado nunca la incorpora por escucharla.
- Antes de confirmar, explica qué reemplaza: un patrón de percusión, la línea de bajo, la melodía o los ajustes de mezcla.
- Permite escuchar la propuesta con el resto del beat y comparar la versión actual.
- Solo «Sí, usar esta idea» incorpora la propuesta. Rechazarla conserva el proyecto exactamente.
- Un cambio manual invalida las propuestas abiertas. También se compara una instantánea de la versión de origen antes de aceptar.
- El avance permanece bloqueado mientras se está decidiendo una propuesta. Volver a otro paso la descarta sin aplicar cambios.
- Deshacer permite recuperar la versión anterior a la aceptación.
- No registra aciertos ni califica los ritmos como buenos o malos.

## Persistencia y compatibilidad

`beatmind-project-v1` conserva el formato de la primera versión. `beatmind-guide-v1` guarda solo inicio, fase actual, fase máxima habilitada y confirmación de estilo. La introducción se muestra en cada entrada; la marca anterior `beatmind-introduction-v1` ya no controla su visibilidad. No se guardan propuestas, preescuchas ni una identidad definitiva.

Cada entrada presenta la introducción, incluso con un proyecto guardado. Si el recorrido ya comenzó, «Continuar mi beat» permite retomar desde la primera pantalla sin repetir las tres. Desde Opciones se puede volver a verla sin reiniciar nada. Crear un proyecto nuevo vuelve a mostrarla; abrir un archivo existente permite ir directamente a editarlo con todas las fases habilitadas. Durante la introducción, los atajos, Arduino, MIDI y joystick no editan el proyecto oculto. La selección de género preserva patrones, volúmenes y silencios existentes, y adapta velocidad y escala al confirmar.

## Identidad y motor

`ASSISTANT` en `src/guide.ts` centraliza el nombre **Byte** y su descripción. `src/Byte.tsx` reúne las poses de la mascota definida por el usuario y asigna una a cada paso (`PHASE_POSES`). Byte aparece en las tres pantallas de la introducción, en la tarjeta del guía de cada paso (cambia de pose al proponer una idea o cuando el usuario la rechaza), en la ayuda y festejando en el último paso.

El motor de propuestas sigue siendo local: patrones por género, bajo ligado al bombo y melodías Markov. No hay un modelo entrenado ni servicio de IA externo conectado. Un proveedor futuro deberá entregar propuestas al mismo flujo de consentimiento, sin tener acceso directo a aplicar cambios al proyecto.

## Verificación

Las pruebas comprueban que preparar, escuchar y rechazar propuestas no cambia el proyecto guardado; que aceptarlas sí incorpora cambios; que editar manualmente invalida propuestas anteriores; que los acompañamientos se pueden omitir; y que los archivos y sesiones anteriores se conservan. También revisan la introducción, su ejemplo independiente, la recuperación de la fase anterior y su repetición desde Opciones; el recorrido en Chrome, exportación de audio real, navegación por teclado y ancho móvil.

Quedan para validación con usuarios principiantes: comprensión de la grilla de 16 casillas, necesidad de ejemplos narrados y comportamiento de la instalación con controles físicos y proyector.

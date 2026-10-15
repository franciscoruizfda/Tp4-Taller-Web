# Alcance inicial y camino de desarrollo

Esta implementación es un prototipo funcional para aprender a componer una primera base. La segunda iteración reemplaza la pantalla de estudio general por un recorrido de siete pasos con **Byte**, una sola tarea visible por fase y consentimiento antes de incorporar propuestas. Se usa BeatMind como nombre provisional; el PDF usa Latido Studio.

## Recorrido actual

Introducción (tu base → recorrido → Byte) → Estilo → Velocidad → Ritmo → Bajo → Melodía → Equilibrio → Tu beat.

La introducción da contexto sin repetir la enseñanza básica previa. Incluye un ejemplo de audio opcional que no cambia el proyecto. Puede repetirse desde Opciones y conserva el progreso anterior. Cada fase invita a una acción concreta con poco texto y una explicación adicional plegada. El bajo y la melodía son opcionales. El progreso se guarda y las fases posteriores se habilitan al avanzar; se puede volver a las fases ya abiertas.

La trivia del PDF queda fuera del recorrido principal hasta tener contenido verificado. La fase de cierre enseña la diferencia entre una base que se repite y una canción con distintas partes; todavía no existe un editor de arreglos.

Byte primero pregunta si el usuario quiere ayuda; después muestra una propuesta que se puede escuchar, comparar, aceptar o rechazar. Prepararla o escucharla no modifica el proyecto. La confirmación describe qué pista será reemplazada. Una edición manual invalida propuestas anteriores. Los controles físicos tampoco pueden aprobar sugerencias automáticamente.

## Correspondencia con las siete fases del PDF

| Fase       | Base implementada                                                                                        | Trabajo pendiente                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1. Género  | Escuchar cuatro estilos, elegir y confirmar; conserva el ritmo existente, ajusta tempo y escala          | Bancos de samples por género y selección de tarjetas por joystick                        |
| 2. Pulso   | Explicación del pulso, control de velocidad, tap de 3–4 golpes y metrónomo visual concéntrico            | Calibración física y medición de sincronía visual/audio                                  |
| 3. Ritmo   | Bombo, caja y hi-hat por separado; casillas manuales y patrones propuestos que requieren aceptación      | Cuantizar al paso más cercano usando timestamps; edición de múltiples patrones           |
| 4. Bajo    | Propuesta ligada al bombo, comparación antes de aceptar, edición manual y opción de omitir               | Edición de duración, piano roll y 808 con glide                                          |
| 5. Melodía | Tres propuestas Markov separadas del proyecto, selección y aceptación; notas manuales y opción de omitir | Exportar MIDI, armonía/acordes editables, arrastrar bloques y enrutamiento avanzado      |
| 6. Mezcla  | Controles simples de volumen/silencio y limpieza propuesta con comparación y consentimiento              | Medidores por pista, detector de clipping, análisis espectral y corrección adaptativa    |
| 7. Trivia  | Fuera del recorrido inicial para no presentar una etapa sin contenido                                    | Audios con origen/licencias documentadas, reproducción a ciegas, respuestas y puntuación |

## Decisiones de esta base

- React + TypeScript + Vite para iterar sobre una interfaz local en el navegador. Web Audio para síntesis, reloj y exportación. Si la instalación exige latencia más baja o drivers dedicados, evaluar una aplicación nativa o un contenedor de escritorio.
- Reloj con anticipación de 100 ms y revisión cada 20 ms. La interfaz sigue el tiempo del contexto de audio. La latencia física y el comportamiento con la pestaña en segundo plano requieren mediciones reales.
- Un único patrón de un compás. La exportación repite ese patrón cuatro veces; todavía no hay una línea de tiempo para intro, verso y estribillo.
- Datos locales, sin backend ni cuentas. El proyecto JSON es portable. El autoguardado no reemplaza una copia descargada.
- Generador local explícito. Ningún llamado externo a IA. El nombre Byte está centralizado en `src/guide.ts` y su mascota en `src/Byte.tsx`; ambos fueron definidos por el usuario. Un modelo generativo real queda abierto para una próxima etapa.
- Propuestas separadas del proyecto y su autoguardado. Solo la aceptación explícita las incorpora. Los ejemplos de estilo tampoco se aplican al escucharlos.
- Proyectos nuevos vacíos y proyectos anteriores preservados. Elegir otro género mantiene golpes y volúmenes; ajusta tempo y escala después de una confirmación textual.
- Controles y detalles técnicos ocultos en Opciones/Ayuda. El swing se conserva en los archivos importados, pero no se muestra en la interfaz inicial para principiantes.
- Identidad provisional. Los colores, fuentes y símbolos se presentan para revisión, sin asumir aprobación final.

## Próximas iteraciones propuestas

1. Validar el prototipo con principiantes: qué entienden por paso, tempo, bajo y mezcla; ajustar la guía según esas observaciones.
2. Confirmar marca, y medir la legibilidad y el contraste en el proyector de la instalación.
3. Definir Arduino, componentes, pines y joystick; escribir firmware y probar eventos, latencia y reconexión.
4. Añadir piano roll, acordes y exportación MIDI; separar patrones y arreglo de canción.
5. Evaluar un modelo generativo musical si las propuestas locales resultan insuficientes; conexión desde backend con validación de salida y límites de gasto.
6. Construir el módulo de trivia con audios autorizados y procedencia verificable. Evitar presentar rasgos sonoros como prueba fiable de autoría.

La tipología de los usuarios, el entorno final (PC, instalación o web pública), la configuración del hardware y el nivel esperado de generación musical siguen abiertos para las próximas decisiones.

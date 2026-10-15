# BeatMind: propuesta visual inicial

> **Actualización 2026-10-09 — Dirección «Neon Studio».** El usuario aportó un moodboard (negro profundo, violeta eléctrico, brillos, vidrio, botones píldora, grilla en perspectiva). Se aplicó como capa de estilo en `src/theme/` (`tokens.css` + `neon.css`) y se creó la skill `.claude/skills/beatmind-neon/` para adaptar pantallas nuevas. El violeta pasa a ser el único acento (`#7442FF` con luces `#AB8EFF`); la menta queda para estados de guardado y consentimiento. Logo, tipografías y nombre de marca **no cambiaron** y siguen pendientes de decisión (la mascota se definió después: ver «Mascota: Byte»). La paleta de abajo es la propuesta anterior.

**Estado: propuesta, pendiente de tu decisión final.** Dirección elegida para explorar: estudio oscuro con violeta y menta, tecnológico y cercano.

## Mascota: Byte (definida por el usuario, 2026-10-09)

Byte es la representación de la IA que acompaña al usuario: un DJ violeta con auriculares de neón. Los originales están en `Mascota/` (12 poses y 6 vistas, PNG con transparencia) y **no se modifican**. La app usa copias recortadas y convertidas a WebP en `src/assets/byte/` (0,5 MB en total).

| Momento                               | Pose                                              |
| ------------------------------------- | ------------------------------------------------- |
| Introducción 1 · qué vas a crear      | `hola` (saludo con los dedos)                     |
| Introducción 2 · cómo es el recorrido | `camina` (paso adelante)                          |
| Introducción 3 · conocer a Byte       | `presenta` (brazos abiertos)                      |
| Estilo                                | `senala`                                          |
| Velocidad                             | `baila`                                           |
| Ritmo                                 | `festeja` (puño arriba)                           |
| Bajo                                  | `agachado`                                        |
| Melodía                               | `idea` (dedo arriba)                              |
| Equilibrio                            | `mezcla` (en la consola)                          |
| Tu beat                               | `aplaude` en la tarjeta final y `hola` en el guía |
| Byte propone una idea                 | `presenta`                                        |
| El usuario prefiere su versión        | `tranqui` (manos en los bolsillos)                |

Quedan sin usar `frente` y las vistas de perfil, tres cuartos y espalda. Para sumar una pose nueva: agregarla al mapa de `src/Byte.tsx`.

**Voz de Byte:** habla en primera persona y de vos, con frases cortas y cálidas, siempre dentro de un globo de diálogo que apunta hacia él. Pregunta y propone; nunca decide por el usuario.

**Criterio de infografía:** la app debe tener más íconos e ilustraciones que texto. Cada paso tiene un ícono propio (recorrido y título), las onomatopeyas e ilustraciones van a gran tamaño y Byte acompaña todas las pantallas.

## Idea de marca

BeatMind acompaña a alguien que está creando su primer beat. La experiencia debe invitar a experimentar, explicar lo necesario en lenguaje simple y dejar al usuario decidir. Frase inicial: «Tu primer beat empieza acá».

Tono: cercano, claro y sin evaluar si una creación es correcta. Ejemplos: «Explorar melodías», «Tres ideas. Vos elegís», «Un clic, un sonido».

## Tipografía

- **Space Grotesk:** marca, títulos y cifras principales. Su geometría le da personalidad sin dificultar la lectura. Usar pesos 500 y 700.
- **Inter:** controles y textos de ayuda. Pesos 400, 500 y 600 para jerarquía sin exceso de mayúsculas.
- Los textos visibles incluyen tildes y caracteres españoles. Las fuentes están instaladas localmente con Fontsource; conservan sus archivos de licencia.

[Space Grotesk y su licencia](https://fontsource.org/fonts/space-grotesk/about) · [Distribución de fuentes locales](https://fontsource.org/docs/getting-started/install)

## Paleta

| Función         | Color     | Uso propuesto                        |
| --------------- | --------- | ------------------------------------ |
| Fondo           | `#111218` | Espacio del estudio                  |
| Superficie      | `#1B1C25` | Paneles y controles                  |
| Violeta         | `#AD94FF` | Acción principal, generación y marca |
| Menta           | `#80D7B7` | Ayuda, estado y limpieza de mezcla   |
| Texto principal | `#F2F1F6` | Títulos y datos principales          |

Los estados también usan texto, formas o iconos; no dependen únicamente del color. Los pequeños textos secundarios necesitarán una revisión adicional en el tamaño y distancia reales de proyección.

## Logo

La pantalla «Identidad visual» permite comparar y descargar tres propuestas vectoriales originales:

1. **Onda / M:** cinco barras de audio forman una M implícita. Es la propuesta inicial aplicada al prototipo.
2. **Pulso:** una señal continua conectada al concepto de Latido Studio del documento original.
3. **Monograma:** una M geométrica con un punto inferior; simple para un icono pequeño.

Las tres propuestas pueden imprimirse y escalarse como SVG. La selección en pantalla sirve como vista previa y no cambia automáticamente el logo de todo el estudio. Antes de fijar una identidad: elegir el nombre definitivo, revisar versiones monocromáticas y probar el símbolo en tamaños pequeños. No se realizó búsqueda de disponibilidad o registro de marca.

Los archivos también están disponibles en `public/brand/`: `beatmind-onda.svg`, `beatmind-pulso.svg` y `beatmind-monograma.svg`.

## Decisiones que quedan en tus manos

- Mantener BeatMind o explorar Latido Studio / otro nombre.
- Elegir el símbolo y ajustar su forma.
- Confirmar tipografías y proporción entre violeta y menta.
- Elegir una frase de marca y el tono de las explicaciones.

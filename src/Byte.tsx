import agachado from './assets/byte/agachado.webp';
import aplaude from './assets/byte/aplaude.webp';
import baila from './assets/byte/baila.webp';
import camina from './assets/byte/camina.webp';
import festeja from './assets/byte/festeja.webp';
import frente from './assets/byte/frente.webp';
import hola from './assets/byte/hola.webp';
import idea from './assets/byte/idea.webp';
import mezcla from './assets/byte/mezcla.webp';
import presenta from './assets/byte/presenta.webp';
import senala from './assets/byte/senala.webp';
import tranqui from './assets/byte/tranqui.webp';

// Trimmed WebP copies of the originals in /Mascota (see docs/identidad-visual.md).
const POSES = {
  agachado,
  aplaude,
  baila,
  camina,
  festeja,
  frente,
  hola,
  idea,
  mezcla,
  presenta,
  senala,
  tranqui,
} as const;
export type BytePose = keyof typeof POSES;

// Preload every pose so changing step never shows the previous one while the next loads.
if (typeof Image !== 'undefined')
  for (const src of Object.values(POSES)) {
    const image = new Image();
    image.src = src;
  }

// One pose per step of the journey, in the order of LESSONS.
export const PHASE_POSES: BytePose[] = [
  'senala',
  'baila',
  'festeja',
  'agachado',
  'idea',
  'mezcla',
  'hola',
];

// Decorative: the assistant's name is always present as text next to the figure.
export default function Byte({ pose, className = '' }: { pose: BytePose; className?: string }) {
  return (
    <img key={pose} className={`byte ${className}`} src={POSES[pose]} alt="" draggable={false} />
  );
}

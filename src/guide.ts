import {
  GENRES,
  generateBass,
  generateMelodies,
  makeProject,
  type Genre,
  type Project,
  type TrackId,
} from './music';

// Byte is the mascot chosen by the user. The name lives here; its poses live in Byte.tsx.
export const ASSISTANT = { name: 'Byte', description: 'Te acompaño en cada paso' };
export const LESSONS = [
  {
    short: 'Estilo',
    title: '¿Qué te dan ganas de crear?',
    intro: 'Escuchá los ejemplos y elegí el estilo que te guste.',
    concept:
      'Un beat es una base musical que se repite. El estilo nos da un punto de partida para los sonidos y la velocidad. No hay una elección correcta.',
    task: 'Escuchá los ejemplos y elegí tu estilo.',
    next: 'Encontrar mi velocidad',
  },
  {
    short: 'Velocidad',
    title: 'Encontrá el pulso de tu idea.',
    intro: 'Escuchá el pulso y encontrá una velocidad que te guste.',
    concept:
      'El pulso es el latido regular de la música. Los BPM indican cuántos pulsos suenan en un minuto. Un número menor suena más tranquilo; uno mayor, más rápido.',
    task: 'Escuchá el pulso y mové el control hasta que te guste.',
    next: 'Crear mi ritmo',
  },
  {
    short: 'Ritmo',
    title: 'Un ritmo, sonido por sonido.',
    intro: 'Combiná bombo, caja y hi-hat. Un sonido por vez.',
    concept:
      'Cada casilla es un momento del ritmo. Si la encendés, el sonido aparece ahí. Al llegar al final, volvemos al principio.',
    task: 'Probá encender algunas casillas y escuchá lo que cambia.',
    next: 'Conocer el bajo',
  },
  {
    short: 'Bajo',
    title: 'Sumemos un poco de profundidad.',
    intro: 'Probá un bajo con tu ritmo, o seguí sin él.',
    concept:
      'El bajo es un sonido grave que le da peso a la música y puede acompañar al bombo. Podés escuchar una idea, crear la tuya o seguir sin él.',
    task: 'Decidí si querés sumar un bajo a tu ritmo.',
    next: 'Explorar una melodía',
  },
  {
    short: 'Melodía',
    title: 'Una idea que puedas tararear.',
    intro: 'Escuchá una idea y elegí si querés sumarla.',
    concept:
      'La melodía es una secuencia de notas que podés tararear. Las notas de una escala funcionan como una familia de sonidos; usamos esa familia para que combinen.',
    task: 'Escuchá una idea o probá crear una propia.',
    next: 'Equilibrar los sonidos',
  },
  {
    short: 'Equilibrio',
    title: 'Que cada sonido tenga su espacio.',
    intro: 'Escuchá tu beat y ajustá cuánto suena cada instrumento.',
    concept:
      'Si una capa tapa a otra, podés bajarla un poco. El objetivo es que escuches lo que te importa de tu idea.',
    task: 'Escuchá tu beat completo y ajustá los volúmenes.',
    next: 'Escuchar y guardar',
  },
  {
    short: 'Tu beat',
    title: 'Escuchá lo que acabás de crear.',
    intro: 'Poné un nombre a tu base y guardala para compartirla.',
    concept:
      'Una base es el comienzo de una canción. Después podés sumar una voz, variar el ritmo y construir partes como una intro o un estribillo.',
    task: 'Poné un nombre a tu idea y guardala para compartirla.',
    next: '',
  },
] as const;
export const RHYTHM_LESSONS = [
  {
    id: 'kick',
    label: 'Bombo',
    comparison: 'El golpe profundo: «pum».',
    explanation:
      'Suele marcar los apoyos principales del ritmo. Probá un golpe al principio y otro en la mitad.',
    word: 'PUM',
  },
  {
    id: 'snare',
    label: 'Caja',
    comparison: 'El golpe seco: «pa».',
    explanation: 'Le responde al bombo y marca acentos. Probá ponerla entre los golpes profundos.',
    word: 'PA',
  },
  {
    id: 'hat',
    label: 'Hi-hat',
    comparison: 'El sonido corto: «ts».',
    explanation:
      'Son pequeños golpes que dan movimiento. Pueden sonar más seguido que el bombo y la caja.',
    word: 'TS',
  },
] as const;

export type Proposal = {
  title: string;
  explanation: string;
  project: Project;
  source: string;
  label?: string;
};
export type GuideProgress = {
  started: boolean;
  phase: number;
  unlocked: number;
  genreChosen: boolean;
};
export const DEFAULT_PROGRESS: GuideProgress = {
  started: false,
  phase: 0,
  unlocked: 0,
  genreChosen: false,
};

export function readProgress(value: unknown): GuideProgress {
  if (!value || typeof value !== 'object') return { ...DEFAULT_PROGRESS };
  const p = value as GuideProgress;
  if (
    typeof p.started !== 'boolean' ||
    typeof p.genreChosen !== 'boolean' ||
    !Number.isInteger(p.phase) ||
    !Number.isInteger(p.unlocked) ||
    p.phase < 0 ||
    p.phase > 6 ||
    p.unlocked < p.phase ||
    p.unlocked > 6 ||
    (p.unlocked > 0 && !p.genreChosen)
  )
    return { ...DEFAULT_PROGRESS };
  return { started: p.started, phase: p.phase, unlocked: p.unlocked, genreChosen: p.genreChosen };
}
export function makeGuidedProject(genre: Genre = 'Trap'): Project {
  const project = makeProject(genre);
  return {
    ...project,
    tracks: project.tracks.map((t) => ({ ...t, steps: Array(16).fill(false) })),
  };
}
export function makeIntroExample(): Project {
  const project = generateBass(makeProject('Pop'));
  const melody = generateMelodies(project, 42)[0];
  return {
    ...project,
    tracks: project.tracks.map((t) =>
      t.id === 'melody' ? { ...t, steps: melody.steps, notes: melody.notes } : t,
    ),
  };
}
export function chooseStyle(project: Project, genre: Genre): Project {
  const scale = GENRES[genre];
  // Keep the user's rhythm and mix, and transpose melodic notes into the chosen scale.
  return {
    ...project,
    genre,
    bpm: scale.bpm,
    tracks: project.tracks.map((t) => {
      if (t.id !== 'bass' && t.id !== 'melody') return t;
      const oldScale = GENRES[project.genre];
      return {
        ...t,
        notes: t.notes.map((note) => {
          const octave = Math.floor((note - oldScale.root) / 12);
          const interval = (((note - oldScale.root) % 12) + 12) % 12;
          const degree = oldScale.intervals.reduce(
            (best, n, i) =>
              Math.abs(n - interval) < Math.abs(oldScale.intervals[best] - interval) ? i : best,
            0,
          );
          return Math.max(24, Math.min(96, scale.root + octave * 12 + scale.intervals[degree]));
        }),
      };
    }),
  };
}
export function suggest(
  project: Project,
  phase: number,
  rhythmId: TrackId,
  seed: number,
): Proposal[] {
  const source = JSON.stringify(project);
  if (phase === 2) {
    const template = makeProject(project.genre).tracks.find((t) => t.id === rhythmId)!;
    return [
      {
        title: `Una idea para el ${template.name.toLowerCase()}`,
        explanation: `Reemplaza solo las casillas de ${template.name.toLowerCase()}. Los otros sonidos quedan igual.`,
        source,
        project: {
          ...project,
          tracks: project.tracks.map((t) =>
            t.id === rhythmId ? { ...t, steps: [...template.steps], muted: false } : t,
          ),
        },
      },
    ];
  }
  if (phase === 3)
    return [
      {
        title: 'Un bajo que acompaña al bombo',
        explanation: 'Reemplaza solo tu bajo con notas que acompañan al bombo.',
        source,
        project: generateBass(project),
      },
    ];
  if (phase === 4) {
    // One melody only. Byte picks the kind of phrase by how much room the rhythm leaves:
    // a busy rhythm gets few notes, a sparse one gets a livelier phrase.
    const hits = project.tracks
      .filter((t) => !t.muted && (t.id === 'kick' || t.id === 'snare' || t.id === 'hat'))
      .reduce((sum, t) => sum + t.steps.filter(Boolean).length, 0);
    const option = generateMelodies(project, seed)[hits > 16 ? 0 : hits >= 6 ? 1 : 2];
    return [
      {
        title: 'Una melodía para tu ritmo',
        explanation: `${option.description} Reemplaza solo tu melodía.`,
        source,
        project: {
          ...project,
          tracks: project.tracks.map((t) =>
            t.id === 'melody'
              ? { ...t, steps: [...option.steps], notes: [...option.notes], muted: false }
              : t,
          ),
        },
      },
    ];
  }
  if (phase === 5)
    return [
      {
        title: 'Un poco más de espacio entre sonidos',
        explanation:
          'Baja los volúmenes más altos, reduce graves de caja, hi-hat y melodía, y suaviza el inicio del bajo.',
        source,
        project: {
          ...project,
          cleanMix: true,
          tracks: project.tracks.map((t) => ({
            ...t,
            volume: Math.min(
              t.volume,
              t.id === 'kick' ? 0.72 : t.id === 'bass' ? 0.55 : t.id === 'hat' ? 0.32 : 0.48,
            ),
          })),
        },
      },
    ];
  return [];
}

export function approveProposal(current: Project, proposal: Proposal): Project {
  if (JSON.stringify(current) !== proposal.source)
    throw new Error('Tu beat cambió. Pedime una nueva idea para trabajar sobre tu versión actual.');
  return proposal.project;
}

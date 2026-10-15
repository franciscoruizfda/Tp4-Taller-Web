export const TRACK_IDS = ['kick', 'snare', 'hat', 'bass', 'melody'] as const;
export type TrackId = (typeof TRACK_IDS)[number];
export type Genre = 'Trap' | 'Pop' | 'Cumbia' | 'Electrónica';
export type Track = {
  id: TrackId;
  name: string;
  detail: string;
  color: string;
  steps: boolean[];
  notes: number[];
  volume: number;
  muted: boolean;
};
export type Project = {
  version: 1;
  name: string;
  genre: Genre;
  bpm: number;
  swing: number;
  tracks: Track[];
  cleanMix: boolean;
};
export const GENRES: Record<
  Genre,
  { bpm: number; scale: string; root: number; intervals: number[]; description: string }
> = {
  Trap: {
    bpm: 140,
    scale: 'La menor',
    root: 45,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Graves profundos y hi-hats con movimiento.',
  },
  Pop: {
    bpm: 110,
    scale: 'Do mayor',
    root: 48,
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Un pulso claro y melodías memorables.',
  },
  Cumbia: {
    bpm: 96,
    scale: 'La menor',
    root: 45,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Percusión a contratiempo y un bajo que camina.',
  },
  Electrónica: {
    bpm: 124,
    scale: 'Re menor',
    root: 38,
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Cuatro al piso. Energía para moverse.',
  },
};
const patterns: Record<Genre, number[][]> = {
  Trap: [
    [0, 6, 10],
    [4, 12],
    [0, 2, 4, 6, 8, 10, 12, 14],
  ],
  Pop: [
    [0, 8, 10],
    [4, 12],
    [0, 2, 4, 6, 8, 10, 12, 14],
  ],
  Cumbia: [
    [0, 8],
    [4, 12],
    [2, 6, 10, 14],
  ],
  Electrónica: [
    [0, 4, 8, 12],
    [4, 12],
    [2, 6, 10, 14],
  ],
};
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export function makeProject(genre: Genre = 'Trap'): Project {
  const info = GENRES[genre];
  const definitions = [
    ['kick', 'Bombo', 'El corazón del beat', '#b09aff'],
    ['snare', 'Caja', 'Marca el acento', '#efb084'],
    ['hat', 'Hi-hat', 'Le da movimiento', '#80d7b7'],
    ['bass', 'Bajo', 'Profundidad y peso', '#8dbaf3'],
    ['melody', 'Melodía', 'Tu idea principal', '#eb97c8'],
  ] as const;
  return {
    version: 1,
    name: 'Mi primer beat',
    genre,
    bpm: info.bpm,
    swing: 0,
    cleanMix: false,
    tracks: definitions.map(([id, name, detail, color], i) => ({
      id,
      name,
      detail,
      color,
      steps: Array.from({ length: 16 }, (_, step) => i < 3 && patterns[genre][i].includes(step)),
      notes: Array(16).fill(info.root + (id === 'melody' ? 24 : 0)),
      volume: [0.72, 0.48, 0.32, 0.55, 0.38][i],
      muted: false,
    })),
  };
}
export function randomSource(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
// First-order Markov transitions between scale degrees, weighted toward consonant notes.
const transitions = [
  [0, 0, 2, 4, 4, 6],
  [0, 2, 2, 4],
  [0, 1, 3, 4, 4],
  [1, 2, 4, 5],
  [0, 0, 2, 3, 5, 6],
  [2, 3, 4, 6],
  [0, 0, 1, 4],
];
export function generateMelodies(
  project: Project,
  seed: number,
): { label: string; description: string; steps: boolean[]; notes: number[] }[] {
  const random = randomSource(seed);
  const scale = GENRES[project.genre];
  return ['Espacio', 'Movimiento', 'Contraste'].map((label, variant) => {
    let degree = variant * 2;
    const notes: number[] = [];
    const steps = Array.from({ length: 16 }, (_, step) => {
      const next = transitions[degree];
      degree = next[Math.floor(random() * next.length)];
      notes.push(scale.root + 24 + scale.intervals[degree]);
      return step === 0 || (step % 2 === 0 ? random() > 0.28 : random() < variant * 0.22);
    });
    return {
      label,
      description: [
        'Pocas notas, más aire.',
        'Una frase con más ritmo.',
        'Acentos que sorprenden.',
      ][variant],
      steps,
      notes,
    };
  });
}
export function generateBass(project: Project): Project {
  const kick = project.tracks.find((t) => t.id === 'kick')!;
  const scale = GENRES[project.genre];
  return {
    ...project,
    tracks: project.tracks.map((t) =>
      t.id !== 'bass'
        ? t
        : {
            ...t,
            muted: false,
            steps: kick.steps.map(
              (active, i) => active || (project.genre === 'Cumbia' && i % 4 === 2),
            ),
            notes: Array.from(
              { length: 16 },
              (_, i) => scale.root + (i >= 8 ? scale.intervals[4] : 0),
            ),
          },
    ),
  };
}
export function varyRhythm(project: Project, seed: number): Project {
  const random = randomSource(seed);
  return {
    ...project,
    tracks: project.tracks.map((t, index) =>
      index > 2
        ? t
        : {
            ...t,
            steps: t.steps.map(
              (active, step) =>
                patterns[project.genre][index].includes(step) ||
                (active && random() > 0.25) ||
                (index === 2 && step % 2 === 1 && random() > 0.68),
            ),
          },
    ),
  };
}
export function tapBpm(taps: number[]): number | null {
  if (taps.length < 3) return null;
  const recent = taps.slice(-4);
  const intervals = recent.slice(1).map((t, i) => t - recent[i]);
  if (intervals.some((i) => i < 250 || i > 1500)) return null;
  return clamp(
    Math.round(60000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length)),
    40,
    200,
  );
}
export function noteName(note: number) {
  return ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'][note % 12];
}
export function stepTime(step: number, project: Project): number {
  return ((step + (step % 2 ? (project.swing / 100) * 0.5 : 0)) * 60) / project.bpm / 4;
}
export function validateProject(value: unknown): Project {
  if (!value || typeof value !== 'object') throw new Error('El archivo no contiene un proyecto.');
  const p = value as Project;
  if (
    p.version !== 1 ||
    !Object.hasOwn(GENRES, p.genre) ||
    typeof p.name !== 'string' ||
    p.name.length > 80 ||
    !Number.isFinite(p.bpm) ||
    p.bpm < 40 ||
    p.bpm > 200 ||
    !Number.isFinite(p.swing) ||
    p.swing < 0 ||
    p.swing > 60 ||
    typeof p.cleanMix !== 'boolean' ||
    !Array.isArray(p.tracks) ||
    p.tracks.length !== 5
  )
    throw new Error('Formato de proyecto incompatible.');
  for (let i = 0; i < TRACK_IDS.length; i++) {
    const t = p.tracks[i];
    if (
      t.id !== TRACK_IDS[i] ||
      !Array.isArray(t.steps) ||
      t.steps.length !== 16 ||
      !t.steps.every((s) => typeof s === 'boolean') ||
      !Array.isArray(t.notes) ||
      t.notes.length !== 16 ||
      !t.notes.every((n) => Number.isInteger(n) && n >= 24 && n <= 96) ||
      !Number.isFinite(t.volume) ||
      t.volume < 0 ||
      t.volume > 1 ||
      typeof t.muted !== 'boolean'
    )
      throw new Error('Las pistas del proyecto no son válidas.');
  }
  const template = makeProject(p.genre);
  return {
    ...p,
    tracks: p.tracks.map((t, i) => ({
      ...template.tracks[i],
      steps: t.steps,
      notes: t.notes,
      volume: t.volume,
      muted: t.muted,
    })),
  };
}

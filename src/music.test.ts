import { describe, expect, it } from 'vitest';
import {
  GENRES,
  generateBass,
  generateMelodies,
  makeProject,
  stepTime,
  tapBpm,
  validateProject,
  type Genre,
} from './music';
import { parseSerial } from './hardware';
import { encodeWav } from './audio';

describe('musical constraints', () => {
  for (const genre of Object.keys(GENRES) as Genre[])
    it(`keeps ${genre} bass and generated melodies in scale`, () => {
      const project = makeProject(genre);
      const scale = GENRES[genre];
      const bass = generateBass(project).tracks[3];
      expect(bass.steps.filter(Boolean).length).toBeGreaterThan(0);
      expect(project.tracks[0].steps.every((on, i) => !on || bass.steps[i])).toBe(true);
      const options = generateMelodies(project, 42);
      expect(options).toHaveLength(3);
      expect(new Set(options.map((o) => JSON.stringify(o))).size).toBe(3);
      for (const notes of [bass.notes, ...options.map((o) => o.notes)])
        for (const note of notes)
          expect(scale.intervals).toContain((((note - scale.root) % 12) + 12) % 12);
      expect(generateMelodies(project, 42)).toEqual(options);
    });
  it('calculates BPM from recent taps and ignores invalid intervals', () => {
    expect(tapBpm([0, 500, 1000, 1500])).toBe(120);
    expect(tapBpm([0, 500])).toBeNull();
    expect(tapBpm([0, 20, 50])).toBeNull();
    expect(tapBpm([0, 2000, 4000])).toBeNull();
  });
  it('swings offbeats without changing bar length', () => {
    const p = { ...makeProject(), bpm: 120, swing: 60 };
    expect(stepTime(1, p)).toBeCloseTo(0.1625);
    expect(stepTime(2, p)).toBeCloseTo(0.25);
    expect(stepTime(16, p)).toBe(2);
  });
});
describe('external data boundaries', () => {
  it('roundtrips projects and rejects malformed tracks and tempo', () => {
    const p = makeProject();
    expect(validateProject(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(() => validateProject({ ...p, bpm: NaN })).toThrow();
    expect(() => validateProject({ ...p, genre: '__proto__' })).toThrow();
    expect(() =>
      validateProject({ ...p, tracks: p.tracks.map((t) => ({ ...t, steps: [true] })) }),
    ).toThrow();
    expect(() =>
      validateProject({
        ...p,
        tracks: p.tracks.map((t) => ({ ...t, notes: Array(16).fill(300) })),
      }),
    ).toThrow();
  });
  it('maps hardware values and ignores corrupted frames', () => {
    expect(parseSerial('{"type":"bpm","value":1023}')).toEqual({ type: 'bpm', value: 200 });
    expect(parseSerial('{"type":"volume","track":"bass","value":127}')).toEqual({
      type: 'volume',
      track: 'bass',
      value: 1,
    });
    expect(parseSerial('{"type":"pad","track":"unknown"}')).toBeNull();
    expect(parseSerial('incomplete{')).toBeNull();
    expect(parseSerial('{"type":"note","note":48,"velocity":0}')).toBeNull();
  });
  it('encodes an interleaved PCM WAV with correct sizes and clamped samples', async () => {
    const buffer = {
      numberOfChannels: 2,
      length: 2,
      sampleRate: 44100,
      getChannelData: (channel: number) =>
        channel === 0 ? new Float32Array([1.5, -1.5]) : new Float32Array([0.5, -0.5]),
    } as AudioBuffer;
    const data = new DataView(await encodeWav(buffer).arrayBuffer());
    expect(data.byteLength).toBe(52);
    expect(data.getUint32(4, true)).toBe(44);
    expect(data.getUint32(40, true)).toBe(8);
    expect(data.getUint16(22, true)).toBe(2);
    expect(data.getInt16(44, true)).toBe(32767);
    expect(data.getInt16(48, true)).toBe(-32768);
  });
});

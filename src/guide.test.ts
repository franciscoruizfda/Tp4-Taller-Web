import { describe, expect, it } from 'vitest';
import { approveProposal, chooseStyle, makeGuidedProject, readProgress, suggest } from './guide';
import { GENRES, makeProject, type Genre } from './music';

describe('guided learning', () => {
  it('starts with a silent project instead of an already composed beat', () => {
    expect(makeGuidedProject().tracks.every((t) => t.steps.every((on) => !on))).toBe(true);
  });
  it('keeps the user rhythm, volumes and mute decisions when choosing a style', () => {
    const original = makeProject('Trap');
    original.tracks[0].steps[3] = true;
    original.tracks[1].muted = true;
    for (const genre of Object.keys(GENRES) as Genre[]) {
      const changed = chooseStyle(original, genre);
      expect(changed.bpm).toBe(GENRES[genre].bpm);
      expect(changed.tracks.map((t) => t.steps)).toEqual(original.tracks.map((t) => t.steps));
      expect(changed.tracks.map((t) => t.volume)).toEqual(original.tracks.map((t) => t.volume));
      expect(changed.tracks[1].muted).toBe(true);
      for (const track of changed.tracks.slice(3))
        for (const note of track.notes)
          expect(GENRES[genre].intervals).toContain((((note - GENRES[genre].root) % 12) + 12) % 12);
    }
  });
  it('discards inconsistent or invalid progress records', () => {
    expect(readProgress({ started: true, phase: 4, unlocked: 2, genreChosen: true }).started).toBe(
      false,
    );
    expect(readProgress({ started: true, phase: 2, unlocked: 2, genreChosen: false }).started).toBe(
      false,
    );
    expect(readProgress({ started: true, phase: 1, unlocked: 3, genreChosen: true })).toEqual({
      started: true,
      phase: 1,
      unlocked: 3,
      genreChosen: true,
    });
  });
});
describe('Byte consent boundaries', () => {
  for (const phase of [2, 3, 4, 5])
    it(`prepares step ${phase} proposals without mutating the user's project`, () => {
      const current = makeProject();
      const snapshot = JSON.stringify(current);
      const proposals = suggest(current, phase, 'snare', 123);
      expect(JSON.stringify(current)).toBe(snapshot);
      expect(proposals.length).toBe(1);
      const accepted = approveProposal(current, proposals[0]);
      expect(accepted).toEqual(proposals[0].project);
      expect(JSON.stringify(current)).toBe(snapshot);
    });
  it('only changes the instrument named in a rhythm proposal', () => {
    const current = makeGuidedProject();
    current.tracks[0].steps[7] = true;
    const candidate = suggest(current, 2, 'snare', 42)[0].project;
    expect(candidate.tracks[0]).toEqual(current.tracks[0]);
    expect(candidate.tracks[2]).toEqual(current.tracks[2]);
    expect(candidate.tracks[1].steps).not.toEqual(current.tracks[1].steps);
  });
  it('cannot accept a proposal made before the user edited their beat', () => {
    const current = makeProject();
    const proposal = suggest(current, 3, 'kick', 42)[0];
    expect(() => approveProposal({ ...current, bpm: 100 }, proposal)).toThrow('Tu beat cambió');
  });
});

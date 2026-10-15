import { stepTime, type Project, type Track, type TrackId } from './music';

type Context = AudioContext | OfflineAudioContext;
type Graph = {
  master: GainNode;
  analyser: AnalyserNode;
  compressor: DynamicsCompressorNode;
  channels: Record<TrackId, GainNode>;
  filters: Record<TrackId, BiquadFilterNode>;
};
function createGraph(context: Context): Graph {
  const master = context.createGain();
  master.gain.value = 0.7;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -10;
  compressor.knee.value = 6;
  compressor.ratio.value = 8;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.12;
  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  master.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(context.destination);
  const channels = {} as Graph['channels'];
  const filters = {} as Graph['filters'];
  for (const id of ['kick', 'snare', 'hat', 'bass', 'melody'] as TrackId[]) {
    channels[id] = context.createGain();
    channels[id].gain.value = 0;
    filters[id] = context.createBiquadFilter();
    filters[id].type = 'highpass';
    filters[id].frequency.value = 10;
    channels[id].connect(filters[id]);
    filters[id].connect(master);
  }
  return { master, compressor, analyser, channels, filters };
}
function syncGraph(context: Context, graph: Graph, project: Project, immediate = false) {
  for (const track of project.tracks) {
    const volume = track.muted ? 0 : track.volume;
    const cutoff = project.cleanMix && ['hat', 'snare', 'melody'].includes(track.id) ? 180 : 10;
    if (immediate) {
      graph.channels[track.id].gain.setValueAtTime(volume, context.currentTime);
      graph.filters[track.id].frequency.setValueAtTime(cutoff, context.currentTime);
    } else {
      graph.channels[track.id].gain.setTargetAtTime(volume, context.currentTime, 0.015);
      graph.filters[track.id].frequency.setTargetAtTime(cutoff, context.currentTime, 0.015);
    }
  }
}
function noise(context: Context) {
  const buffer = context.createBuffer(1, context.sampleRate * 0.25, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}
function voice(
  context: Context,
  output: AudioNode,
  track: Track,
  note: number,
  at: number,
  duration: number,
  noiseBuffer: AudioBuffer,
  cleanMix: boolean,
  velocity = 1,
): AudioScheduledSourceNode[] {
  const amp = context.createGain();
  amp.connect(output);
  const gain =
    track.id === 'hat' ? 0.3 : track.id === 'melody' ? 0.18 : track.id === 'bass' ? 0.48 : 0.7;
  const length =
    track.id === 'hat'
      ? 0.07
      : track.id === 'snare'
        ? 0.17
        : track.id === 'kick'
          ? 0.35
          : duration * 0.85;
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, gain * velocity),
    at + (track.id === 'bass' && cleanMix ? 0.055 : 0.004),
  );
  amp.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(length, 0.08));
  const sources: AudioScheduledSourceNode[] = [];
  let noiseFilter: BiquadFilterNode | undefined;
  if (track.id === 'hat' || track.id === 'snare') {
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    noiseFilter = filter;
    filter.type = 'highpass';
    filter.frequency.value = track.id === 'hat' ? 7000 : 1500;
    source.connect(filter);
    filter.connect(amp);
    source.start(at);
    source.stop(at + length);
    sources.push(source);
  } else {
    const oscillator = context.createOscillator();
    oscillator.type = track.id === 'melody' ? 'triangle' : 'sine';
    const freq = 440 * 2 ** ((note - 69) / 12);
    if (track.id === 'kick') {
      oscillator.frequency.setValueAtTime(155, at);
      oscillator.frequency.exponentialRampToValueAtTime(44, at + 0.12);
    } else {
      oscillator.frequency.setValueAtTime(freq, at);
    }
    oscillator.connect(amp);
    oscillator.start(at);
    oscillator.stop(at + Math.max(length, 0.08));
    sources.push(oscillator);
  }
  let ended = 0;
  for (const source of sources)
    source.onended = () => {
      source.disconnect();
      if (++ended === sources.length) {
        amp.disconnect();
        noiseFilter?.disconnect();
      }
    };
  return sources;
}
export class AudioEngine {
  context?: AudioContext;
  graph?: Graph;
  private noiseBuffer?: AudioBuffer;
  private timer?: ReturnType<typeof setInterval>;
  private sources = new Set<AudioScheduledSourceNode>();
  private frame = 0;
  private nextStep = 0;
  private nextAt = 0;
  private visual: { step: number; at: number }[] = [];
  private project?: () => Project;
  private callback?: (step: number) => void;
  private playVersion = 0;
  async init() {
    if (!this.context) {
      this.context = new AudioContext();
      this.graph = createGraph(this.context);
      this.noiseBuffer = noise(this.context);
    }
    await this.context.resume();
  }
  async play(project: () => Project, callback: (step: number) => void) {
    this.stop();
    const request = this.playVersion;
    await this.init();
    if (request !== this.playVersion) return false;
    this.project = project;
    this.callback = callback;
    this.nextStep = 0;
    this.nextAt = this.context!.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), 20);
    this.schedule();
    this.animate();
    return true;
  }
  private schedule() {
    const context = this.context!;
    const project = this.project!();
    syncGraph(context, this.graph!, project);
    if (this.nextAt < context.currentTime - 0.2) {
      this.nextAt = context.currentTime + 0.03;
      this.visual = [];
    }
    while (this.nextAt < context.currentTime + 0.1) {
      const step = this.nextStep;
      for (const track of project.tracks)
        if (track.steps[step]) {
          const sources = voice(
            context,
            this.graph!.channels[track.id],
            track,
            track.notes[step],
            this.nextAt,
            60 / project.bpm / 2,
            this.noiseBuffer!,
            project.cleanMix,
          );
          for (const source of sources) {
            this.sources.add(source);
            source.addEventListener('ended', () => this.sources.delete(source));
          }
        }
      this.visual.push({ step, at: this.nextAt });
      const sixteenth = 60 / project.bpm / 4;
      this.nextAt += sixteenth * (1 + ((step % 2 === 0 ? 1 : -1) * project.swing) / 200);
      this.nextStep = (step + 1) % 16;
    }
  }
  private animate = () => {
    while (this.visual.length && this.visual[0].at <= this.context!.currentTime)
      this.callback?.(this.visual.shift()!.step);
    this.frame = requestAnimationFrame(this.animate);
  };
  stop() {
    this.playVersion++;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    cancelAnimationFrame(this.frame);
    this.visual = [];
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        /* Already ended. */
      }
    }
    this.sources.clear();
  }
  async preview(track: Track, note: number, project: Project, velocity = 1) {
    const request = this.playVersion;
    await this.init();
    if (request !== this.playVersion) return;
    syncGraph(this.context!, this.graph!, project);
    const sources = voice(
      this.context!,
      this.graph!.channels[track.id],
      track,
      note,
      this.context!.currentTime + 0.01,
      0.4,
      this.noiseBuffer!,
      project.cleanMix,
      velocity,
    );
    for (const source of sources) {
      this.sources.add(source);
      source.addEventListener('ended', () => this.sources.delete(source));
    }
  }
  async previewMelody(track: Track, project: Project) {
    await this.init();
    syncGraph(this.context!, this.graph!, project);
    const start = this.context!.currentTime + 0.03;
    for (let step = 0; step < 16; step++)
      if (track.steps[step]) {
        for (const source of voice(
          this.context!,
          this.graph!.channels[track.id],
          track,
          track.notes[step],
          start + stepTime(step, project),
          60 / project.bpm / 2,
          this.noiseBuffer!,
          project.cleanMix,
        )) {
          this.sources.add(source);
          source.addEventListener('ended', () => this.sources.delete(source));
        }
      }
  }
  levels() {
    if (!this.graph) return { peak: 0, spectrum: Array(32).fill(0) as number[] };
    const wave = new Float32Array(this.graph.analyser.fftSize);
    this.graph.analyser.getFloatTimeDomainData(wave);
    const bins = new Uint8Array(this.graph.analyser.frequencyBinCount);
    this.graph.analyser.getByteFrequencyData(bins);
    return {
      peak: Math.max(...wave.map(Math.abs)),
      spectrum: Array.from({ length: 32 }, (_, i) => bins[i * 4] / 255),
    };
  }
  dispose() {
    this.stop();
    void this.context?.close();
  }
}
export async function exportWav(project: Project, bars = 4) {
  const duration = (bars * 240) / project.bpm;
  const context = new OfflineAudioContext(2, Math.ceil((duration + 0.6) * 44100), 44100);
  const graph = createGraph(context);
  syncGraph(context, graph, project, true);
  const buffer = noise(context);
  for (let bar = 0; bar < bars; bar++)
    for (let step = 0; step < 16; step++)
      for (const track of project.tracks)
        if (track.steps[step])
          voice(
            context,
            graph.channels[track.id],
            track,
            track.notes[step],
            (bar * 240) / project.bpm + stepTime(step, project),
            60 / project.bpm / 2,
            buffer,
            project.cleanMix,
          );
  return encodeWav(await context.startRendering());
}
export function encodeWav(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const bytes = buffer.length * channels * 2;
  const data = new ArrayBuffer(44 + bytes);
  const view = new DataView(data);
  const write = (offset: number, text: string) =>
    [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  write(0, 'RIFF');
  view.setUint32(4, 36 + bytes, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, bytes, true);
  const samples = Array.from({ length: channels }, (_, i) => buffer.getChannelData(i));
  for (let i = 0; i < buffer.length; i++)
    for (let ch = 0; ch < channels; ch++) {
      const sample = Math.max(-1, Math.min(1, samples[ch][i]));
      view.setInt16(44 + (i * channels + ch) * 2, sample * (sample < 0 ? 32768 : 32767), true);
    }
  return new Blob([data], { type: 'audio/wav' });
}

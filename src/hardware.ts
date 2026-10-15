import { clamp, type TrackId } from './music';

export type HardwareEvent =
  | { type: 'bpm'; value: number }
  | { type: 'tap' }
  | { type: 'pad'; track: TrackId }
  | { type: 'note'; note: number; velocity: number }
  | { type: 'volume'; track: TrackId; value: number }
  | { type: 'assist' };
const tracks = ['kick', 'snare', 'hat', 'bass', 'melody'];
export function parseSerial(line: string): HardwareEvent | null {
  try {
    const event = JSON.parse(line);
    if (event.type === 'bpm' && Number.isFinite(event.value))
      return {
        type: 'bpm',
        value: clamp(Math.round(40 + (clamp(event.value, 0, 1023) / 1023) * 160), 40, 200),
      };
    if (event.type === 'tap' || event.type === 'assist') return { type: event.type };
    if (event.type === 'pad' && tracks.includes(event.track))
      return { type: 'pad', track: event.track };
    if (event.type === 'volume' && tracks.includes(event.track) && Number.isFinite(event.value))
      return { type: 'volume', track: event.track, value: clamp(event.value, 0, 127) / 127 };
    if (
      event.type === 'note' &&
      Number.isInteger(event.note) &&
      event.note >= 24 &&
      event.note <= 96 &&
      Number.isFinite(event.velocity) &&
      event.velocity > 0
    )
      return { type: 'note', note: event.note, velocity: clamp(event.velocity, 1, 127) };
  } catch {
    /* Ignore incomplete or malformed sensor messages. */
  }
  return null;
}
type SerialPort = {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
};
type SerialNavigator = Navigator & { serial?: { requestPort(): Promise<SerialPort> } };
export async function connectSerial(
  onEvent: (event: HardwareEvent) => void,
  onStatus: (text: string) => void,
) {
  const serial = (navigator as SerialNavigator).serial;
  if (!serial) throw new Error('Serial no está disponible. Probá Chrome o Edge en localhost.');
  const port = await serial.requestPort();
  await port.open({ baudRate: 115200 });
  if (!port.readable) {
    await port.close();
    throw new Error('El puerto no permite lectura.');
  }
  const reader = port.readable.getReader();
  const decoder = new TextDecoder();
  let stopped = false;
  let pending = '';
  onStatus('Serial conectado · 115200 baud');
  void (async () => {
    try {
      while (!stopped) {
        const { value, done } = await reader.read();
        if (done) break;
        pending += decoder.decode(value, { stream: true });
        const lines = pending.split('\n');
        pending = lines.pop() ?? '';
        if (pending.length > 4096) pending = '';
        for (const line of lines) {
          const event = parseSerial(line.trim());
          if (event) onEvent(event);
        }
      }
    } catch {
      if (!stopped) onStatus('Se perdió la conexión Serial.');
    } finally {
      reader.releaseLock();
      try {
        await port.close();
      } catch {
        /* Device disconnected. */
      }
      onStatus('Serial desconectado');
    }
  })();
  return async () => {
    stopped = true;
    await reader.cancel();
  };
}
export async function connectMidi(
  onEvent: (event: HardwareEvent) => void,
  onStatus: (text: string) => void,
) {
  if (!navigator.requestMIDIAccess) throw new Error('MIDI no está disponible en este navegador.');
  const access = await navigator.requestMIDIAccess();
  const bound = new Set<MIDIInput>();
  const bind = () => {
    for (const input of access.inputs.values()) {
      input.onmidimessage = (event) => {
        if (!event.data || event.data.length < 3) return;
        const [status, note, velocity] = event.data;
        if ((status & 0xf0) === 0x90 && velocity > 0) {
          const percussion: Record<number, TrackId> = { 36: 'kick', 38: 'snare', 42: 'hat' };
          if (percussion[note]) onEvent({ type: 'pad', track: percussion[note] });
          else if (note >= 24 && note <= 96) onEvent({ type: 'note', note, velocity });
        }
        if ((status & 0xf0) === 0xb0) {
          if (note >= 20 && note <= 24)
            onEvent({ type: 'volume', track: tracks[note - 20] as TrackId, value: velocity / 127 });
          if (note === 1) onEvent({ type: 'bpm', value: Math.round(40 + (velocity / 127) * 160) });
        }
      };
      bound.add(input);
    }
    onStatus(
      access.inputs.size
        ? `MIDI · ${access.inputs.size} entrada(s)`
        : 'MIDI habilitado · conectá un dispositivo',
    );
  };
  access.onstatechange = bind;
  bind();
  return () => {
    access.onstatechange = null;
    for (const input of bound) input.onmidimessage = null;
    onStatus('MIDI desconectado');
  };
}

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  ChevronDown,
  Download,
  Drum,
  FolderOpen,
  Gauge,
  Headphones,
  LockKeyhole,
  Music2,
  Palette,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Speaker,
  Undo2,
  Usb,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from 'lucide-react';
import BrandView from './BrandView';
import Byte, { PHASE_POSES } from './Byte';
import trapPhoto from './assets/styles/trap.png';
import popPhoto from './assets/styles/pop.png';
import cumbiaPhoto from './assets/styles/cumbia.png';
import electronicaPhoto from './assets/styles/electronica.png';
import Introduction from './Introduction';
import { AudioEngine, exportWav } from './audio';
import { download, filename } from './files';
import {
  ASSISTANT,
  DEFAULT_PROGRESS,
  LESSONS,
  RHYTHM_LESSONS,
  approveProposal,
  chooseStyle,
  makeGuidedProject,
  makeIntroExample,
  readProgress,
  suggest,
  type Proposal,
} from './guide';
import {
  GENRES,
  makeProject,
  noteName,
  tapBpm,
  validateProject,
  type Genre,
  type Project,
  type Track,
  type TrackId,
} from './music';
import { connectMidi, connectSerial, type HardwareEvent } from './hardware';
import { bloquearNucleo3, desbloquearNucleo3, useNucleo3Abierto } from './nucleo3';
import './guided.css';

const STORAGE_KEY = 'beatmind-project-v1';
// "Ir a núcleo 3" goes back to the Figma prototype this app is part of, on its Núcleo 3 slide
// (node 265-167). If it is ever emptied, the button still shows and Byte says it is not ready.
const NEXT_NUCLEUS_URL =
  'https://www.figma.com/proto/Qz1d1AwBF25vTohWgY3tLd/Taller?node-id=265-167&viewport=396%2C42%2C0.03&t=jfn8lmM8aoVzfVte-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=54%3A66&page-id=0%3A1';
const GUIDE_KEY = 'beatmind-guide-v1';
function initialSession() {
  let project = makeGuidedProject();
  let existing = false;
  let progress = { ...DEFAULT_PROGRESS };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      project = validateProject(JSON.parse(saved));
      existing = true;
    }
  } catch {
    /* Invalid saves leave a clean starting point. */
  }
  try {
    const guide = localStorage.getItem(GUIDE_KEY);
    if (guide && existing) progress = readProgress(JSON.parse(guide));
    else if (existing) progress.genreChosen = true;
  } catch {
    /* Start the guide from its introduction. */
  }
  return { project, progress, existing };
}
type Modal = 'settings' | 'help' | 'new' | null;
const PULSE_LABEL = 'Solo el pulso';
const RHYTHM_NEXT = ['Seguir con la caja', 'Seguir con el hi-hat'];
const STYLE_PHOTOS: Record<Genre, string> = {
  Trap: trapPhoto,
  Pop: popPhoto,
  Cumbia: cumbiaPhoto,
  Electrónica: electronicaPhoto,
};
const STYLES: Record<Genre, { adjective: string; feeling: string }> = {
  Trap: {
    adjective: 'Profundo y relajado',
    feeling: 'Graves con peso y pequeños sonidos rápidos.',
  },
  Pop: { adjective: 'Fresco y pegadizo', feeling: 'Un pulso claro, fácil de seguir y cantar.' },
  Cumbia: { adjective: 'Alegre y en movimiento', feeling: 'Un ritmo que invita a bailar.' },
  Electrónica: {
    adjective: 'Constante y enérgico',
    feeling: 'Golpes regulares para moverse sin parar.',
  },
};

// One icon per step of the journey, in the order of LESSONS.
const STEP_ICONS: LucideIcon[] = [
  Headphones,
  Gauge,
  Drum,
  Speaker,
  Music2,
  SlidersHorizontal,
  Download,
];

// What Byte says, in a speech bubble. `replies` are the user's possible answers: they sit inside
// the bubble, right under the sentence, like the answers of a chat.
function ByteSays({
  title,
  replies,
  children,
}: {
  title: string;
  replies?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="byte-says" key={title}>
      <h2>{title}</h2>
      <p>{children}</p>
      {replies && <div className="byte-replies">{replies}</div>}
    </div>
  );
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    dialog?.querySelector<HTMLElement>('button')?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab' && dialog) {
        const items = Array.from(
          dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, a[href]'),
        );
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      previous?.focus();
    };
  }, []);
  return (
    <div className="g-modal-backdrop" onClick={onClose}>
      <section
        className="g-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="g-icon close-dialog" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 id="dialog-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}

function StepEditor({
  track,
  step,
  onToggle,
}: {
  track: Track;
  step: number;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="learning-sequence" style={{ '--sound-color': track.color } as CSSProperties}>
      <div className="learning-sequence-title">
        <span>Tu patrón de {track.name.toLowerCase()}</span>
        <span>
          {track.steps.filter(Boolean).length}{' '}
          {track.steps.filter(Boolean).length === 1 ? 'sonido' : 'sonidos'}
        </span>
      </div>
      <div className="learning-steps" role="group" aria-label={`Patrón de ${track.name}`}>
        {track.steps.map((on, index) => (
          <button
            key={index}
            className={`learning-step ${on ? 'on' : ''} ${step === index ? 'sounding' : ''}`}
            aria-label={`${track.name}, paso ${index + 1}`}
            aria-pressed={on}
            onClick={() => onToggle(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {on ? (
              <span className="step-note">
                {['bass', 'melody'].includes(track.id) ? (
                  noteName(track.notes[index])
                ) : (
                  <AudioLines size={20} />
                )}
              </span>
            ) : (
              <Plus size={17} />
            )}
            <span className="sr-only">{on ? 'Encendido' : 'Apagado'}</span>
          </button>
        ))}
      </div>
      <p>
        <span className="sequence-key" /> Encendido: suena <span className="sequence-key off" />{' '}
        Apagado: hay un silencio
      </p>
    </div>
  );
}

export default function App() {
  const [session] = useState(initialSession);
  const [project, setProject] = useState(session.project);
  const [progress, setProgress] = useState(session.progress);
  const [showIntro, setShowIntro] = useState(true);
  const [candidateGenre, setCandidateGenre] = useState<Genre | null>(
    session.progress.genreChosen ? session.project.genre : null,
  );
  const [page, setPage] = useState<'guide' | 'brand'>('guide');
  const [rhythmPart, setRhythmPart] = useState(0);
  const [manualNote, setManualNote] = useState<number | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState(0);
  const [declined, setDeclined] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audition, setAudition] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const nucleusOpen = useNucleo3Abierto();
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [history, setHistory] = useState<Project[]>([]);
  const [peak, setPeak] = useState(0);
  const [hardwareStatus, setHardwareStatus] = useState('Sin dispositivos conectados');
  const [serialConnected, setSerialConnected] = useState(false);
  const [midiConnected, setMidiConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const projectRef = useRef(project);
  projectRef.current = project;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const rhythmRef = useRef(rhythmPart);
  rhythmRef.current = rhythmPart;
  const stepRef = useRef(step);
  stepRef.current = step;
  const auditionRef = useRef(audition);
  auditionRef.current = audition;
  const uiRef = useRef({ modal, page, showIntro });
  uiRef.current = { modal, page, showIntro };
  const engineRef = useRef<AudioEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();
  const engine = engineRef.current;
  const taps = useRef<number[]>([]);
  const serialCleanup = useRef<(() => Promise<void>) | null>(null);
  const midiCleanup = useRef<(() => void) | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const lessonRef = useRef<HTMLHeadingElement>(null);
  const phase = progress.phase;
  const lesson = LESSONS[phase];
  const LessonIcon = STEP_ICONS[phase];
  const rhythmLesson = RHYTHM_LESSONS[rhythmPart];
  const activeTracks = project.tracks.filter((t) => !t.muted && t.steps.some(Boolean));
  const hasRhythm = project.tracks.slice(0, 3).some((t) => !t.muted && t.steps.some(Boolean));
  const hasKick = !project.tracks[0].muted && project.tracks[0].steps.some(Boolean);
  const notice = useCallback((message: string) => setToast(message), []);
  const stop = useCallback(() => {
    engine.stop();
    setPlaying(false);
    setAudition(null);
    auditionRef.current = null;
    setStep(-1);
    setPeak(0);
  }, [engine]);
  const commit = useCallback(
    (update: (p: Project) => Project) => {
      // The pulse keeps playing while the speed changes, so the new tempo is heard right away.
      if (auditionRef.current && auditionRef.current !== PULSE_LABEL) stop();
      const current = projectRef.current;
      const next = update(current);
      projectRef.current = next;
      setProject(next);
      setHistory((h) => [...h.slice(-19), current]);
      setProposals([]);
      setDeclined(false);
    },
    [stop],
  );
  useEffect(() => {
    setSaved(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        localStorage.setItem(GUIDE_KEY, JSON.stringify(progress));
        setSaved(true);
      } catch {
        notice('No pudimos guardar acá. Podés descargar una copia en el último paso.');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [project, progress, notice]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(
    () => () => {
      engine.dispose();
      void serialCleanup.current?.();
      midiCleanup.current?.();
    },
    [engine],
  );
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPeak(engine.levels().peak), 80);
    return () => clearInterval(timer);
  }, [playing, engine]);
  useEffect(() => {
    if (progress.started && page === 'guide' && !showIntro) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      lessonRef.current?.focus({ preventScroll: true });
    }
  }, [phase, progress.started, page, showIntro]);
  const listen = useCallback(
    async (draft?: Project | (() => Project), label?: string) => {
      stop();
      try {
        const started = await engine.play(
          () => (typeof draft === 'function' ? draft() : (draft ?? projectRef.current)),
          setStep,
        );
        if (started === false) return;
        setPlaying(true);
        setAudition(label ?? null);
        auditionRef.current = label ?? null;
      } catch {
        notice('No pudimos reproducir el audio. Revisá la salida de sonido del navegador.');
      }
    },
    [engine, stop, notice],
  );
  const togglePlay = useCallback(() => {
    if (playing) stop();
    else void listen();
  }, [playing, stop, listen]);
  const previewSound = useCallback(
    (track: Track, note = track.notes[0], velocity = 1) => {
      stop();
      const previewProject = {
        ...projectRef.current,
        tracks: projectRef.current.tracks.map((t) =>
          t.id === track.id ? { ...t, muted: false, volume: Math.max(t.volume, 0.4) } : t,
        ),
      };
      void engine
        .preview(track, note, previewProject, velocity)
        .catch(() => notice('No pudimos escuchar este sonido.'));
    },
    [engine, stop, notice],
  );
  const tap = useCallback(() => {
    const now = performance.now();
    if (taps.current.length && now - taps.current.at(-1)! > 1500) taps.current = [];
    taps.current = [...taps.current.slice(-3), now];
    const bpm = tapBpm(taps.current);
    if (bpm) {
      commit((p) => ({ ...p, bpm }));
      notice(`Tu pulso: ${bpm} golpes por minuto.`);
    } else notice('Seguí marcando el pulso: necesitamos al menos tres golpes.');
  }, [commit, notice]);
  const requestIdeas = useCallback(() => {
    const currentPhase = progressRef.current.phase;
    if (currentPhase === 3 && !projectRef.current.tracks[0].steps.some(Boolean)) {
      notice('Para seguir al bombo, primero necesitamos agregar alguno de sus golpes.');
      return;
    }
    stop();
    setDeclined(false);
    setSelectedProposal(0);
    setProposals(
      suggest(projectRef.current, currentPhase, RHYTHM_LESSONS[rhythmRef.current].id, Date.now()),
    );
  }, [notice, stop]);
  const acceptIdea = () => {
    const proposal = proposals[selectedProposal];
    if (!proposal) return;
    try {
      const next = approveProposal(projectRef.current, proposal);
      stop();
      commit(() => next);
      notice('Listo, sumé la idea que elegiste. Podés deshacerla cuando quieras.');
    } catch (error) {
      stop();
      setProposals([]);
      notice(error instanceof Error ? error.message : 'Pedime una nueva idea.');
    }
  };
  const rejectIdea = () => {
    stop();
    setProposals([]);
    setDeclined(true);
    notice('Seguimos con tu versión. No cambié tu beat.');
  };
  const navigate = useCallback(
    (target: number) => {
      const current = progressRef.current;
      if (target < 0 || target > current.unlocked) return;
      stop();
      setProposals([]);
      setDeclined(false);
      setManualNote(null);
      setProgress((p) => ({ ...p, phase: target }));
    },
    [stop],
  );
  const next = () => {
    if (phase === 0) {
      if (!candidateGenre) return;
      commit((p) => chooseStyle(p, candidateGenre));
    }
    if (phase >= 6 || proposals.length) return;
    // Rhythm is three sounds in a row: «next» walks through them before leaving the step.
    if (phase === 2 && rhythmPart < 2) {
      stop();
      setDeclined(false);
      setRhythmPart(rhythmPart + 1);
      return;
    }
    if (phase === 2 && !hasRhythm) return;
    stop();
    setDeclined(false);
    setManualNote(null);
    if (phase === 1) setRhythmPart(0);
    setProgress((p) => ({
      ...p,
      phase: p.phase + 1,
      unlocked: Math.max(p.unlocked, p.phase + 1),
      genreChosen: true,
    }));
  };
  const back = () => {
    if (phase === 2 && rhythmPart > 0) {
      stop();
      setProposals([]);
      setDeclined(false);
      setRhythmPart(rhythmPart - 1);
      return;
    }
    // Coming back from the bass lands on the last rhythm sound, mirroring the way forward.
    if (phase === 3) setRhythmPart(2);
    navigate(phase - 1);
  };
  const toggleStep = (id: TrackId, index: number) => {
    const track = projectRef.current.tracks.find((t) => t.id === id)!;
    const note = manualNote ?? track.notes[index];
    commit((p) => ({
      ...p,
      tracks: p.tracks.map((t) =>
        t.id === id
          ? {
              ...t,
              muted: false,
              steps: t.steps.map((on, i) => (i === index ? !on : on)),
              notes: t.notes.map((n, i) => (i === index ? note : n)),
            }
          : t,
      ),
    }));
    if (!track.steps[index] && !playing) previewSound(track, note);
  };
  const hardwareEvent = useCallback(
    (event: HardwareEvent) => {
      const state = progressRef.current;
      if (
        !state.started ||
        uiRef.current.modal ||
        uiRef.current.page !== 'guide' ||
        uiRef.current.showIntro
      )
        return;
      if (event.type === 'assist') {
        if (state.phase >= 2 && state.phase <= 5) requestIdeas();
        else notice('En esta etapa, elegí una opción en pantalla.');
        return;
      }
      if (event.type === 'bpm' && state.phase === 1) commit((p) => ({ ...p, bpm: event.value }));
      if (event.type === 'tap' && state.phase === 1) tap();
      if (event.type === 'volume' && state.phase === 5)
        commit((p) => ({
          ...p,
          tracks: p.tracks.map((t) => (t.id === event.track ? { ...t, volume: event.value } : t)),
        }));
      if (event.type === 'pad' && state.phase === 2) {
        const position = Math.max(0, stepRef.current);
        const track = projectRef.current.tracks.find((t) => t.id === event.track)!;
        commit((p) => ({
          ...p,
          tracks: p.tracks.map((t) =>
            t.id === event.track
              ? { ...t, muted: false, steps: t.steps.map((on, i) => (i === position ? !on : on)) }
              : t,
          ),
        }));
        if (!auditionRef.current)
          void engine
            .preview(track, track.notes[position], projectRef.current)
            .catch(() => notice('No pudimos reproducir el pad.'));
      }
      if (event.type === 'note' && (state.phase === 3 || state.phase === 4)) {
        const id = state.phase === 3 ? 'bass' : 'melody';
        const track = projectRef.current.tracks.find((t) => t.id === id)!;
        const scale = GENRES[projectRef.current.genre];
        const allowed = Array.from({ length: 6 }, (_, octave) =>
          scale.intervals.map((interval) => scale.root - 12 + octave * 12 + interval),
        )
          .flat()
          .filter((n) => n >= 24 && n <= 96);
        const note = allowed.reduce(
          (best, n) => (Math.abs(n - event.note) < Math.abs(best - event.note) ? n : best),
          allowed[0],
        );
        const position = Math.max(0, stepRef.current);
        commit((p) => ({
          ...p,
          tracks: p.tracks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  muted: false,
                  steps: t.steps.map((on, i) => (i === position ? true : on)),
                  notes: t.notes.map((n, i) => (i === position ? note : n)),
                }
              : t,
          ),
        }));
        void engine
          .preview(track, note, projectRef.current, event.velocity / 127)
          .catch(() => notice('No pudimos reproducir la nota.'));
      }
    },
    [commit, engine, notice, requestIdeas, tap],
  );
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!progress.started || page !== 'guide' || modal || showIntro) return;
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SUMMARY', 'A'].includes(target.tagName) ||
        target.isContentEditable
      )
        return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key.toLowerCase() === 'i' && phase >= 2 && phase <= 5) requestIdeas();
      if (e.key.toLowerCase() === 't' && phase === 1) tap();
      if (['1', '2', '3'].includes(e.key))
        hardwareEvent({
          type: 'pad',
          track: (['kick', 'snare', 'hat'] as TrackId[])[Number(e.key) - 1],
        });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    progress.started,
    phase,
    page,
    modal,
    showIntro,
    togglePlay,
    requestIdeas,
    tap,
    hardwareEvent,
  ]);
  useEffect(() => {
    let lastButtons: boolean[] = [];
    let lastMove = 0;
    const timer = setInterval(() => {
      const pad = navigator.getGamepads?.().find((p) => p?.connected);
      if (!pad || !progress.started || page !== 'guide' || modal || showIntro) return;
      if (Math.abs(pad.axes[0]) > 0.65 && Date.now() - lastMove > 400) {
        navigate(progressRef.current.phase + (pad.axes[0] > 0 ? 1 : -1));
        lastMove = Date.now();
      }
      if (pad.buttons[0]?.pressed && !lastButtons[0]) togglePlay();
      if (pad.buttons[1]?.pressed && !lastButtons[1] && phase >= 2 && phase <= 5) requestIdeas();
      lastButtons = pad.buttons.map((b) => b.pressed);
    }, 80);
    return () => clearInterval(timer);
  }, [progress.started, page, modal, showIntro, phase, navigate, togglePlay, requestIdeas]);
  const connect = async (kind: 'serial' | 'midi') => {
    setConnecting(true);
    try {
      if (kind === 'serial') {
        serialCleanup.current = await connectSerial(hardwareEvent, (text) => {
          setHardwareStatus(text);
          setSerialConnected(text.startsWith('Serial conectado'));
        });
        setSerialConnected(true);
      } else {
        midiCleanup.current = await connectMidi(hardwareEvent, setHardwareStatus);
        setMidiConnected(true);
      }
    } catch (error) {
      notice(error instanceof Error ? error.message : 'No se pudo conectar el dispositivo.');
    } finally {
      setConnecting(false);
    }
  };
  const saveFile = () =>
    download(
      new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }),
      `${filename(project.name)}.beatmind.json`,
    );
  const exportAudio = async () => {
    setExporting(true);
    try {
      download(await exportWav(projectRef.current), `${filename(projectRef.current.name)}.wav`);
      desbloquearNucleo3();
      notice('Tu beat está listo para compartir. Lo guardamos como audio WAV. Ya podés seguir al núcleo 3.');
    } catch {
      notice('No pudimos guardar el audio. Intentá otra vez.');
    } finally {
      setExporting(false);
    }
  };
  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    stop();
    setProposals([]);
    setDeclined(false);
    setProject(previous);
    projectRef.current = previous;
    setHistory((h) => h.slice(0, -1));
    setCandidateGenre(previous.genre);
    notice('Volvimos a tu versión anterior.');
  };
  const startNew = () => {
    stop();
    // A new beat is a new visitor: they have to make and download their own to go on.
    bloquearNucleo3();
    commit(() => makeGuidedProject());
    // Many people share one screen: the previous beat must not come back through Undo.
    setHistory([]);
    setProgress({ ...DEFAULT_PROGRESS });
    setShowIntro(true);
    setCandidateGenre(null);
    setRhythmPart(0);
    setModal(null);
    setPage('guide');
  };
  const finishIntro = () => {
    stop();
    setProgress((p) => ({ ...p, started: true }));
    setShowIntro(false);
  };
  const currentTrack = project.tracks.find(
    (t) => t.id === (phase === 2 ? rhythmLesson.id : phase === 3 ? 'bass' : 'melody'),
  )!;
  const selected = proposals[selectedProposal];
  const askText =
    phase === 2
      ? `¿Querés que te proponga unas casillas para el ${rhythmLesson.label.toLowerCase()}?`
      : phase === 3
        ? '¿Querés que prepare un bajo que acompañe a tu bombo?'
        : phase === 4
          ? '¿Querés que prepare una melodía para tu beat?'
          : '¿Querés escuchar una propuesta para equilibrar tu beat?';
  const canContinue =
    phase === 0 ? candidateGenre !== null : phase === 2 ? rhythmPart < 2 || hasRhythm : true;
  const nextLabel =
    phase === 0
      ? candidateGenre
        ? `Usar ${candidateGenre} y seguir`
        : 'Elegí un estilo para seguir'
      : phase === 3
        ? currentTrack.steps.some(Boolean)
          ? 'Seguir con este bajo'
          : 'Continuar sin bajo'
        : phase === 4
          ? currentTrack.steps.some(Boolean)
            ? 'Seguir con esta melodía'
            : 'Continuar sin melodía'
          : phase === 2 && rhythmPart < 2
            ? RHYTHM_NEXT[rhythmPart]
            : lesson.next;

  // The header only carries the brand, and the help / options buttons were removed at the
  // user's request: the 'help' and 'settings' dialogs below are kept but have no entry point.
  const tools = (
    <div className="guide-tools">
      <span className="guide-save">
        <i className={saved ? 'saved' : ''} />
        {saved ? 'Guardado' : 'Guardando…'}
      </span>
      <button className="guide-tool" onClick={() => setModal('new')}>
        <RotateCcw size={16} />
        Reiniciar
      </button>
    </div>
  );

  return (
    <div className="guide-app">
      <header className="guide-header">
        <a
          href="#"
          className="guide-brand"
          onClick={(e) => {
            e.preventDefault();
            stop();
            setPage('guide');
          }}
        >
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" />
          <span>
            beatmind<span>.</span>
          </span>
        </a>
      </header>
      {page === 'brand' ? (
        <div className="brand-in-guide">
          <button className="g-button quiet" onClick={() => setPage('guide')}>
            <ArrowLeft size={17} /> Volver a mi beat
          </button>
          <BrandView />
        </div>
      ) : showIntro ? (
        <Introduction
          previewing={audition === 'Base de ejemplo'}
          returning={progress.started}
          continuing={session.existing && activeTracks.length > 0}
          projectName={project.name}
          onPreview={() => void listen(makeIntroExample(), 'Base de ejemplo')}
          onStop={stop}
          onFinish={finishIntro}
          onRestart={() => setModal('new')}
        />
      ) : (
        <div className="guide-shell">
          <div className="guide-rail">
            <nav className="guide-progress" aria-label="Tu recorrido">
              <div className="guide-progress-label">
                <span>
                  PASO {phase + 1} DE {LESSONS.length}
                </span>
                <span>Aprendé a tu ritmo</span>
              </div>
              <ol>
                {LESSONS.map((item, index) => {
                  const StepIcon = STEP_ICONS[index];
                  return (
                    <li key={item.short}>
                      <button
                        className={`${index === phase ? 'current' : ''} ${index < progress.unlocked ? 'visited' : ''}`}
                        disabled={index > progress.unlocked}
                        aria-current={index === phase ? 'step' : undefined}
                        aria-label={`Paso ${index + 1}: ${item.short}`}
                        onClick={() => navigate(index)}
                      >
                        <span>
                          <StepIcon size={20} />
                          {index > progress.unlocked ? (
                            <i>
                              <LockKeyhole size={10} />
                            </i>
                          ) : index < progress.unlocked ? (
                            <i>
                              <Check size={11} />
                            </i>
                          ) : null}
                        </span>
                        <strong>{item.short}</strong>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
            {tools}
          </div>
          <main className="guide-main">
            <section className="lesson-heading">
              <span className="lesson-icon" aria-hidden="true">
                <LessonIcon size={34} />
              </span>
              <div>
                <h1 ref={lessonRef} tabIndex={-1}>
                  {lesson.title}
                </h1>
                <p>{lesson.intro}</p>
              </div>
              <a
                className={`nucleus-link ${nucleusOpen ? '' : 'locked'}`}
                href={nucleusOpen && NEXT_NUCLEUS_URL ? NEXT_NUCLEUS_URL : '#'}
                aria-label={nucleusOpen ? 'Ir a núcleo 3' : 'Ir a núcleo 3: bloqueado hasta que descargues tu beat'}
                aria-disabled={nucleusOpen ? undefined : true}
                onClick={(e) => {
                  if (!nucleusOpen) {
                    e.preventDefault();
                    notice('Antes de seguir, creá tu beat y descargalo en el último paso, con «Guardar mi beat como audio».');
                    return;
                  }
                  stop();
                  if (!NEXT_NUCLEUS_URL) {
                    e.preventDefault();
                    notice('Todavía no tengo el enlace al núcleo 3. ¡Muy pronto!');
                  }
                }}
              >
                <span>
                  <small>{nucleusOpen ? 'Seguí la infografía' : 'Primero descargá tu beat'}</small>
                  Ir a núcleo 3
                </span>
                <i aria-hidden="true">{nucleusOpen ? <ArrowRight size={22} /> : <LockKeyhole size={20} />}</i>
              </a>
            </section>
            <div className="lesson-layout">
              <div className="lesson-workspace">
                {phase === 0 && (
                  <section className="lesson-card style-lesson">
                    <div className="task-heading">
                      <Headphones size={20} />
                      <h2>Primero escuchá. Después elegí.</h2>
                    </div>
                    <div className="style-choices">
                      {(Object.keys(GENRES) as Genre[]).map((genre, index) => (
                        <div
                          key={genre}
                          className={`style-choice ${candidateGenre === genre ? 'chosen' : ''}`}
                        >
                          <button
                            className="style-select"
                            aria-pressed={candidateGenre === genre}
                            onClick={() => setCandidateGenre(genre)}
                          >
                            <span className={`style-visual style-visual-${index}`}>
                              <img src={STYLE_PHOTOS[genre]} alt="" />
                            </span>
                            <span className="style-name">
                              {genre}
                              <span>
                                {candidateGenre === genre ? (
                                  <Check size={15} />
                                ) : (
                                  <Plus size={15} />
                                )}
                              </span>
                            </span>
                            <strong>{STYLES[genre].adjective}</strong>
                            <p>{STYLES[genre].feeling}</p>
                          </button>
                          <button
                            className="style-listen"
                            onClick={() => {
                              if (audition === `Ejemplo de ${genre}`) stop();
                              else void listen(makeProject(genre), `Ejemplo de ${genre}`);
                            }}
                          >
                            {audition === `Ejemplo de ${genre}` ? (
                              <Pause size={15} />
                            ) : (
                              <Play size={15} />
                            )}{' '}
                            {audition === `Ejemplo de ${genre}`
                              ? 'Detener ejemplo'
                              : `Escuchar ${genre}`}
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="lesson-caption">
                      Escuchar un ejemplo no lo agrega a tu beat. Tu elección se confirma al seguir.
                    </p>
                  </section>
                )}
                {phase === 1 && (
                  <section className="lesson-card tempo-lesson">
                    <div className="task-heading">
                      <AudioLines size={20} />
                      <h2>¿A qué velocidad se siente bien?</h2>
                    </div>
                    <div
                      className={`pulse-display ${playing ? 'pulsing' : ''}`}
                      style={{ '--pulse-speed': `${60 / project.bpm}s` } as CSSProperties}
                    >
                      <span className="pulse-ring" />
                      <span className="pulse-ring outer" />
                      <div>
                        <strong>{project.bpm}</strong>
                        <span>golpes por minuto</span>
                      </div>
                    </div>
                    <label className="tempo-slider-label" htmlFor="guide-bpm">
                      La velocidad de tu beat
                    </label>
                    <input
                      id="guide-bpm"
                      className="tempo-slider"
                      type="range"
                      min="40"
                      max="200"
                      value={project.bpm}
                      onChange={(e) => commit((p) => ({ ...p, bpm: Number(e.target.value) }))}
                    />
                    <div className="tempo-labels">
                      <span>Tranquilo</span>
                      <span>Con movimiento</span>
                      <span>Enérgico</span>
                    </div>
                    <div className="tempo-actions">
                      <button
                        className="g-button secondary"
                        onClick={() => {
                          if (audition === PULSE_LABEL) stop();
                          else {
                            const pulse = makeGuidedProject(project.genre);
                            pulse.tracks[0].steps = Array.from(
                              { length: 16 },
                              (_, i) => i % 4 === 0,
                            );
                            // Read the speed on every beat, so moving the slider is heard live.
                            void listen(
                              () => ({ ...pulse, bpm: projectRef.current.bpm }),
                              PULSE_LABEL,
                            );
                          }
                        }}
                      >
                        {audition === PULSE_LABEL ? <Pause size={17} /> : <Play size={17} />}
                        {audition === PULSE_LABEL ? 'Detener pulso' : 'Escuchar el pulso'}
                      </button>
                      <button className="g-button quiet tap-tempo" onClick={tap}>
                        Marcar con mi mano
                      </button>
                    </div>
                    <p className="lesson-caption">
                      También podés marcar tu velocidad con tres o cuatro clics seguidos.
                    </p>
                  </section>
                )}
                {phase === 2 && (
                  <section className="lesson-card rhythm-lesson">
                    <div className="rhythm-tabs" role="group" aria-label="Sonidos de la percusión">
                      {RHYTHM_LESSONS.map((item, index) => (
                        <button
                          key={item.id}
                          aria-pressed={rhythmPart === index}
                          className={rhythmPart === index ? 'selected' : ''}
                          style={{ '--sound-color': project.tracks[index].color } as CSSProperties}
                          onClick={() => {
                            stop();
                            setRhythmPart(index);
                            setProposals([]);
                            setDeclined(false);
                          }}
                        >
                          <span>{index + 1}</span>
                          {item.label}
                          {project.tracks[index].steps.some(Boolean) && <i />}
                        </button>
                      ))}
                    </div>
                    <div className="sound-introduction">
                      <div
                        className="sound-word"
                        style={{ '--sound-color': currentTrack.color } as CSSProperties}
                      >
                        {rhythmLesson.word}
                      </div>
                      <div>
                        <h2>{rhythmLesson.label}</h2>
                        <strong>{rhythmLesson.comparison}</strong>
                        <p>{rhythmLesson.explanation}</p>
                      </div>
                      <button className="g-button quiet" onClick={() => previewSound(currentTrack)}>
                        <Volume2 size={17} />
                        Escuchar sonido
                      </button>
                    </div>
                    <StepEditor
                      track={currentTrack}
                      step={audition ? -1 : step}
                      onToggle={(index) => toggleStep(currentTrack.id, index)}
                    />
                    {!hasRhythm && (
                      <p className="task-reminder">
                        Encendé al menos una casilla para crear tu primer ritmo.
                      </p>
                    )}
                  </section>
                )}
                {(phase === 3 || phase === 4) && (
                  <section
                    className="lesson-card notes-lesson"
                    style={{ '--sound-color': currentTrack.color } as CSSProperties}
                  >
                    <div className={`notes-illustration ${phase === 3 ? 'bass' : 'melody'}`}>
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="notes-status">
                      {currentTrack.steps.some(Boolean) ? (
                        <>
                          <span className="g-check-circle">
                            <Check size={18} />
                          </span>
                          <h2>
                            {phase === 3
                              ? 'Tu bajo ya es parte del beat.'
                              : 'Tu melodía ya es parte del beat.'}
                          </h2>
                          <p>Podés escucharlo con los otros sonidos, editarlo o pedir otra idea.</p>
                        </>
                      ) : (
                        <>
                          <h2>
                            {phase === 3
                              ? 'Escuchá qué puede sumar un bajo.'
                              : 'Probá distintos caminos.'}
                          </h2>
                          <p>
                            {phase === 3
                              ? `${ASSISTANT.name} puede preparar una idea siguiendo tu bombo. Primero la escuchás; después decidís si se queda.`
                              : `${ASSISTANT.name} puede preparar una melodía que combine con tu ritmo. No se agrega hasta que vos la elijas.`}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="manual-notes">
                      <p>
                        Elegí una nota para escucharla. Después encendé casillas para ponerla en tu
                        beat.
                      </p>
                      <div className="note-keys">
                        {GENRES[project.genre].intervals.slice(0, 5).map((interval) => {
                          const note =
                            GENRES[project.genre].root + interval + (phase === 4 ? 24 : 0);
                          return (
                            <button
                              key={note}
                              aria-pressed={(manualNote ?? currentTrack.notes[0]) === note}
                              className={
                                (manualNote ?? currentTrack.notes[0]) === note ? 'selected' : ''
                              }
                              onClick={() => {
                                setManualNote(note);
                                previewSound(currentTrack, note);
                              }}
                            >
                              {noteName(note)}
                              <Music2 size={16} />
                            </button>
                          );
                        })}
                      </div>
                      <StepEditor
                        track={currentTrack}
                        step={audition ? -1 : step}
                        onToggle={(index) => toggleStep(currentTrack.id, index)}
                      />
                      <button
                        className="g-text"
                        onClick={() =>
                          commit((p) => ({
                            ...p,
                            tracks: p.tracks.map((t) =>
                              t.id === currentTrack.id ? { ...t, steps: Array(16).fill(false) } : t,
                            ),
                          }))
                        }
                      >
                        Quitar {phase === 3 ? 'el bajo' : 'la melodía'}
                      </button>
                    </div>
                  </section>
                )}
                {phase === 5 && (
                  <section className="lesson-card balance-lesson">
                    <div className="task-heading">
                      <Volume2 size={20} />
                      <h2>Más suave o más fuerte. Vos escuchás.</h2>
                    </div>
                    <div className="balance-tracks">
                      {project.tracks.map((track) => (
                        <div
                          className={`balance-track ${!track.steps.some(Boolean) ? 'empty' : ''}`}
                          style={{ '--sound-color': track.color } as CSSProperties}
                          key={track.id}
                        >
                          <div className="balance-name">
                            <span className="sound-marker" />
                            <strong>{track.name}</strong>
                            <span>
                              {track.steps.some(Boolean)
                                ? track.muted
                                  ? 'En silencio'
                                  : 'En tu beat'
                                : 'No lo agregaste'}
                            </span>
                          </div>
                          <div className="balance-slider">
                            <span>Suave</span>
                            <input
                              aria-label={`Volumen ${track.name}`}
                              type="range"
                              min="0"
                              max="100"
                              disabled={!track.steps.some(Boolean)}
                              value={Math.round(track.volume * 100)}
                              onChange={(e) =>
                                commit((p) => ({
                                  ...p,
                                  tracks: p.tracks.map((t) =>
                                    t.id === track.id
                                      ? { ...t, volume: Number(e.target.value) / 100 }
                                      : t,
                                  ),
                                }))
                              }
                            />
                            <span>Fuerte</span>
                          </div>
                          <span className="balance-value" aria-hidden="true">
                            {Math.round(track.volume * 100)}
                          </span>
                          <button
                            className="g-icon balance-mute"
                            aria-label={`${track.muted ? 'Activar' : 'Silenciar'} ${track.name}`}
                            disabled={!track.steps.some(Boolean)}
                            onClick={() =>
                              commit((p) => ({
                                ...p,
                                tracks: p.tracks.map((t) =>
                                  t.id === track.id ? { ...t, muted: !t.muted } : t,
                                ),
                              }))
                            }
                          >
                            {track.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                          </button>
                        </div>
                      ))}
                    </div>
                    {project.cleanMix && (
                      <div className="balance-applied">
                        <Check size={16} /> La propuesta de equilibrio que elegiste está aplicada.
                        <button
                          className="g-text"
                          onClick={() => commit((p) => ({ ...p, cleanMix: false }))}
                        >
                          Quitar filtros
                        </button>
                      </div>
                    )}
                  </section>
                )}
                {phase === 6 && (
                  <section className="lesson-card finish-lesson">
                    <div className="finish-art">
                      <Byte pose="aplaude" />
                      <span>
                        <Check size={20} />
                      </span>
                    </div>
                    <h2>Este beat lleva tus decisiones.</h2>
                    <label htmlFor="beat-name">¿Cómo se llama tu primera idea?</label>
                    <input
                      id="beat-name"
                      aria-label="Nombre del proyecto"
                      maxLength={80}
                      value={project.name}
                      onChange={(e) => commit((p) => ({ ...p, name: e.target.value }))}
                    />
                    <div className="finish-layers">
                      {activeTracks.map((t) => (
                        <span key={t.id}>
                          <i style={{ background: t.color }} />
                          {t.name}
                        </span>
                      ))}
                    </div>
                    <button
                      className="g-button primary big"
                      disabled={exporting || !activeTracks.length}
                      onClick={() => void exportAudio()}
                    >
                      <Download size={19} />
                      {exporting ? 'Preparando tu audio…' : 'Guardar mi beat como audio'}
                    </button>
                    <p className="lesson-caption">
                      Un archivo WAV con tu base repetida cuatro veces. Listo para escuchar y
                      compartir.
                    </p>
                    <p className={`nucleus-hint ${nucleusOpen ? 'open' : ''}`}>
                      {nucleusOpen ? <Check size={16} /> : <LockKeyhole size={16} />}
                      {nucleusOpen
                        ? 'Núcleo 3 desbloqueado: ya podés seguir con la infografía.'
                        : 'Al descargarlo se desbloquea el núcleo 3.'}
                    </p>
                    <button className="g-text" onClick={saveFile}>
                      <FolderOpen size={17} />
                      Guardar proyecto para seguir editando
                    </button>
                  </section>
                )}

                {phase === 0 && audition && (
                  <div className="example-playing" role="status">
                    <Headphones size={17} />
                    <span>{audition}. Tu beat no cambió.</span>
                    <button className="g-text" onClick={stop}>
                      Detener
                    </button>
                  </div>
                )}
              </div>
              <aside className="beaty-column">
                <section className="beaty-card">
                  <div className="guide-stage">
                    <div>
                      <strong className="guide-name">{ASSISTANT.name}</strong>
                      <span className="guide-role">{ASSISTANT.description}</span>
                    </div>
                    <Byte
                      pose={
                        proposals.length ? 'presenta' : declined ? 'tranqui' : PHASE_POSES[phase]
                      }
                      className="guide-figure"
                    />
                  </div>
                  <div className="beaty-content">
                    {phase === 0 ? (
                      <ByteSays title="¿Cuál te gusta?">
                        Escuchalos tranquilo. Con el que elijas, yo ajusto la velocidad y las notas.
                        Tu ritmo se conserva.
                      </ByteSays>
                    ) : phase === 1 ? (
                      <ByteSays title="Seguí el pulso conmigo.">
                        ¿Tranquilo o más rápido? Movelo y escuchá hasta que te guste.
                      </ByteSays>
                    ) : phase === 6 ? (
                      <ByteSays title="¡Lo hiciste vos!">
                        Yo solo te acompañé. Guardá tu base o volvé a un paso para seguir probando.
                      </ByteSays>
                    ) : proposals.length ? (
                      <ByteSays
                        title="Te preparé una idea. ¿La usamos?"
                        replies={
                          <>
                            <button
                              className="g-button listen-idea"
                              onClick={() => {
                                if (audition === selected.title) stop();
                                else void listen(selected.project, selected.title);
                              }}
                            >
                              {audition === selected.title ? <Pause size={16} /> : <Play size={16} />}
                              {audition === selected.title
                                ? 'Detener propuesta'
                                : 'Escuchar propuesta'}
                            </button>
                            <button className="g-button primary" onClick={acceptIdea}>
                              <Check size={17} />
                              Sí, usar esta idea
                            </button>
                            <button className="g-button keep-mine" onClick={rejectIdea}>
                              <X size={16} />
                              No, seguir con mi versión
                            </button>
                          </>
                        }
                      >
                        {selected.explanation} Escuchala primero: tu beat no cambia hasta que digas
                        que sí.
                      </ByteSays>
                    ) : declined ? (
                      <ByteSays
                        title="Seguimos con tu idea."
                        replies={
                          <button
                            className="g-button secondary"
                            disabled={phase === 3 && !hasKick}
                            onClick={requestIdeas}
                          >
                            <Sparkles size={16} />
                            Ver otra propuesta
                          </button>
                        }
                      >
                        No cambié nada de tu beat. Si querés, te muestro otra.
                      </ByteSays>
                    ) : (
                      <ByteSays
                        title={askText}
                        replies={
                          <>
                            <button
                              className="g-button primary"
                              disabled={phase === 3 && !hasKick}
                              onClick={requestIdeas}
                            >
                              <Sparkles size={16} />
                              Sí, mostrame una idea
                            </button>
                            <button className="g-button keep-mine" onClick={() => setDeclined(true)}>
                              <X size={16} />
                              Prefiero probar por mi cuenta
                            </button>
                            {phase === 3 && !hasKick && (
                              <span className="beaty-tip">
                                Para esta propuesta necesitamos un bombo. Podés agregarlo en el paso
                                anterior o seguir sin bajo.
                              </span>
                            )}
                          </>
                        }
                      >
                        La escuchás con tu beat y vos elegís si la usamos.
                      </ByteSays>
                    )}
                  </div>
                </section>
                <button className="undo-guide" disabled={!history.length} onClick={undo}>
                  <Undo2 size={16} />
                  Deshacer último cambio
                </button>
              </aside>
            </div>
            <footer className="lesson-footer">
              <button
                className="g-button quiet"
                disabled={phase === 0}
                onClick={back}
              >
                <ArrowLeft size={17} />
                Volver
              </button>
              {phase > 0 && (
                <section
                  className={`listen-bar ${audition ? 'previewing' : ''}`}
                  aria-label="Escucha"
                >
                  <button
                    className="g-listen-play"
                    aria-label={playing ? 'Detener escucha' : 'Escuchar mi beat'}
                    onClick={togglePlay}
                  >
                    {playing ? (
                      <Pause size={22} fill="currentColor" />
                    ) : (
                      <Play size={22} fill="currentColor" />
                    )}
                  </button>
                  <div>
                    <strong>{audition ?? 'Escuchá tu beat hasta acá'}</strong>
                    <span>
                      {audition
                        ? 'Es una prueba. Tu beat no cambió.'
                        : `${activeTracks.length} ${activeTracks.length === 1 ? 'sonido' : 'sonidos'} · ${project.bpm} golpes por minuto`}
                    </span>
                  </div>
                  <div className="listen-wave" aria-hidden="true">
                    {Array.from({ length: 13 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          height: `${playing ? 6 + peak * 50 * (0.3 + (i % 4) / 4) : 6}px`,
                        }}
                      />
                    ))}
                  </div>
                  {audition && (
                    <button className="g-text" onClick={() => void listen()}>
                      Volver a mi beat
                    </button>
                  )}
                </section>
              )}
              <span>
                {proposals.length
                  ? 'Elegí si querés usar la propuesta o seguir con tu versión.'
                  : phase === 2 && !hasRhythm
                    ? 'Tu ritmo empieza con una casilla encendida.'
                    : ''}
              </span>
              {phase < 6 ? (
                <button
                  className="g-button primary"
                  disabled={!canContinue || !!proposals.length}
                  onClick={next}
                >
                  {nextLabel}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button className="g-button secondary" onClick={() => setModal('new')}>
                  <Plus size={17} />
                  Crear otro beat
                </button>
              )}
            </footer>
          </main>
        </div>
      )}
      <input
        ref={importRef}
        type="file"
        accept=".json"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            if (file.size > 1000000) throw new Error('El archivo es demasiado grande.');
            const parsed = validateProject(JSON.parse(await file.text()));
            stop();
            commit(() => parsed);
            setProgress({ started: true, phase: 6, unlocked: 6, genreChosen: true });
            setShowIntro(false);
            setCandidateGenre(parsed.genre);
            setPage('guide');
            setModal(null);
            notice('Abrimos tu proyecto. Podés volver a los pasos para editarlo.');
          } catch (error) {
            notice(
              error instanceof Error ? error.message : 'Este archivo no es un proyecto compatible.',
            );
          }
        }}
      />
      {toast && (
        <div className="g-toast" role="status">
          <Byte pose="frente" className="byte-avatar" />
          {toast}
          <button className="g-icon" aria-label="Cerrar aviso" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Dialog
          title={
            modal === 'help'
              ? 'Un paso a la vez'
              : modal === 'new'
                ? 'Reiniciar y empezar de cero'
                : 'Tu espacio, tus opciones'
          }
          onClose={() => setModal(null)}
        >
          {modal === 'help' ? (
            <>
              <div className="help-byte">
                <Byte pose="hola" className="byte-help" />
                <span className="byte-bubble tail-left">¡Hola! Soy {ASSISTANT.name}, tu guía.</span>
              </div>
              <p>
                En cada paso vas a conocer una parte del beat, escucharla y elegir qué hacer. Las
                próximas etapas se abren cuando avanzás, y siempre podés volver.
              </p>
              <p>
                {ASSISTANT.name} te pregunta antes de preparar una propuesta. Escucharla no cambia
                tu beat: se agrega únicamente con <strong>«Sí, usar esta idea»</strong>. También
                podés rechazarla.
              </p>
              <details className="g-details">
                <summary>Sobre {ASSISTANT.name} y los controles</summary>
                <p>
                  {ASSISTANT.name} es el asistente de BeatMind. En esta versión genera propuestas
                  con Markov y reglas musicales locales; la conexión a un modelo generativo queda
                  para una próxima etapa.
                </p>
                <p>
                  Espacio: escuchar o detener. T: marcar el pulso en Velocidad. I: pedir propuestas.
                  1, 2 y 3: pads en Ritmo. El joystick y el botón de asistencia preparan ideas;
                  nunca las aceptan.
                </p>
              </details>
            </>
          ) : modal === 'new' ? (
            <>
              <p>
                Se va a borrar el beat que está en pantalla para que puedas crear uno nuevo desde el
                principio. Si querés conservarlo, antes descargá una copia.
              </p>
              <button className="g-button secondary full" onClick={saveFile}>
                <Download size={17} />
                Guardar una copia de mi proyecto
              </button>
              <button className="g-button primary full" onClick={startNew}>
                Empezar un beat nuevo
                <ArrowRight size={17} />
              </button>
              <p className="g-fine-print">
                Después de reiniciar, el beat anterior no se puede recuperar desde esta pantalla.
              </p>
            </>
          ) : (
            <>
              <div className="settings-list">
                <button
                  onClick={() => {
                    stop();
                    setProposals([]);
                    setDeclined(false);
                    setPage('guide');
                    setShowIntro(true);
                    setModal(null);
                  }}
                >
                  <Headphones size={20} />
                  <span>
                    Ver introducción
                    <small>Qué vas a crear y cómo te acompaña {ASSISTANT.name}</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
                <button
                  onClick={() => {
                    stop();
                    setPage('brand');
                    setModal(null);
                  }}
                >
                  <Palette size={20} />
                  <span>
                    Identidad visual<small>Paleta, tipografías y propuestas de logo</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
                <button onClick={saveFile}>
                  <Download size={20} />
                  <span>
                    Guardar proyecto editable<small>Una copia para continuar otro día</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
                <button onClick={() => importRef.current?.click()}>
                  <FolderOpen size={20} />
                  <span>
                    Abrir proyecto<small>Recuperar un archivo que guardaste</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
                <button onClick={() => setModal('new')}>
                  <Plus size={20} />
                  <span>
                    Empezar otro beat<small>Un nuevo recorrido desde el principio</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              </div>
              <details className="g-details hardware-settings">
                <summary>
                  <span>
                    <Usb size={17} />
                    Conectar controles físicos
                  </span>
                  <ChevronDown size={17} />
                </summary>
                <p>
                  Podés usar todo el recorrido con mouse. Estas conexiones necesitan validación con
                  el hardware real.
                </p>
                <div className="hardware-status">{hardwareStatus}</div>
                <button
                  className="g-button secondary full"
                  disabled={connecting}
                  onClick={() => {
                    if (serialConnected) {
                      void serialCleanup.current?.();
                      serialCleanup.current = null;
                      setSerialConnected(false);
                    } else void connect('serial');
                  }}
                >
                  {serialConnected ? 'Desconectar Serial' : 'Conectar Arduino / Serial'}
                </button>
                <button
                  className="g-button secondary full"
                  disabled={connecting}
                  onClick={() => {
                    if (midiConnected) {
                      midiCleanup.current?.();
                      midiCleanup.current = null;
                      setMidiConnected(false);
                    } else void connect('midi');
                  }}
                >
                  {midiConnected ? 'Desconectar MIDI' : 'Habilitar MIDI USB'}
                </button>
              </details>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}

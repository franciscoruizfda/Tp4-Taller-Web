import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Check,
  Download,
  Headphones,
  Music2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import Byte from './Byte';
import { ASSISTANT } from './guide';
import './introduction.css';

type Props = {
  previewing: boolean;
  returning: boolean;
  continuing: boolean;
  projectName: string;
  onPreview: () => void;
  onStop: () => void;
  onFinish: () => void;
  onRestart: () => void;
};

export default function Introduction({
  previewing,
  returning,
  continuing,
  projectName,
  onPreview,
  onStop,
  onFinish,
  onRestart,
}: Props) {
  const [screen, setScreen] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, [screen]);
  const move = (next: number) => {
    onStop();
    setScreen(next);
  };

  return (
    <main className="introduction" aria-label="Introducción a BeatMind">
      <div className="intro-progress">
        <span>ANTES DE EMPEZAR</span>
        <div aria-label={`Introducción ${screen + 1} de 3`}>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={index === screen ? 'current' : index < screen ? 'seen' : ''}
            />
          ))}
        </div>
        <span>{screen + 1} / 3</span>
      </div>
      <section className="intro-screen">
        {screen === 0 ? (
          <>
            <div className="intro-visual">
              <div className={`intro-track-art ${previewing ? 'playing' : ''}`} aria-hidden="true">
                <span className="intro-art-tag">
                  <AudioLines size={16} />
                  TU PROPIA IDEA
                </span>
                {['Ritmo', 'Bajo', 'Melodía'].map((label, row) => (
                  <div className={`intro-art-row row-${row}`} key={label}>
                    <span>{label}</span>
                    <div>
                      {Array.from({ length: 8 }, (_, index) => (
                        <i
                          key={index}
                          className={(index + row) % 3 === 0 ? 'rest' : ''}
                          style={{ height: `${18 + ((index * 7 + row * 3) % 25)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <span className="intro-art-note">
                  <Music2 size={15} />
                  Sonidos que se convierten en tu base
                </span>
              </div>
              <Byte pose="hola" className="intro-byte" />
              <span className="byte-bubble tail-right intro-say">¡Hola! Soy {ASSISTANT.name}.</span>
            </div>
            <h1 ref={headingRef} tabIndex={-1}>
              Acá empieza
              <br />
              <span>tu primera base.</span>
            </h1>
            <p>
              En BeatMind vas a combinar los sonidos que conociste para crear una base musical
              propia.
            </p>
            <button className="intro-example" onClick={previewing ? onStop : onPreview}>
              {previewing ? <Pause size={17} /> : <Play size={17} />}
              {previewing ? 'Detener ejemplo' : 'Escuchar una base de ejemplo'}
            </button>
            {previewing && (
              <span className="intro-preview-note" role="status">
                Solo estamos escuchando. Tu proyecto no cambia.
              </span>
            )}
          </>
        ) : screen === 1 ? (
          <>
            <div className="intro-visual route">
              <Byte pose="camina" className="intro-byte" />
              <span className="byte-bubble tail-left intro-say">Yo te acompaño en cada paso.</span>
              <div
                className="intro-route"
                aria-label="Elegir un estilo, sumar sonidos y guardar tu base"
              >
                <div>
                  <span>
                    <Headphones size={29} />
                  </span>
                  <strong>Elegí un estilo</strong>
                </div>
                <ArrowRight size={19} />
                <div>
                  <span>
                    <Music2 size={29} />
                  </span>
                  <strong>Sumá sonidos</strong>
                </div>
                <ArrowRight size={19} />
                <div>
                  <span>
                    <Download size={29} />
                  </span>
                  <strong>Guardá tu base</strong>
                </div>
              </div>
            </div>
            <h1 ref={headingRef} tabIndex={-1}>
              De a poco,
              <br />
              <span>y a tu manera.</span>
            </h1>
            <p>
              Una etapa por vez: vas a escuchar, probar y elegir. No necesitás saber producir
              música.
            </p>
            <span className="intro-reassurance">Podés volver atrás y cambiar lo que quieras.</span>
          </>
        ) : (
          <>
            <div className="intro-beaty-art">
              <Byte pose="presenta" className="intro-byte" />
              <span className="intro-beaty-bubble">
                ¿Querés escuchar una idea?
                <SparkleMark />
              </span>
            </div>
            <h1 ref={headingRef} tabIndex={-1}>
              Con {ASSISTANT.name},<br />
              <span>vos decidís.</span>
            </h1>
            <p>
              Te acompaño con ideas para tu ritmo y tus melodías. Las escuchás y elegís si las
              usamos.
            </p>
            <span className="intro-reassurance consent">
              <Check size={17} />
              No agrego sonidos sin preguntarte.
            </span>
            {(returning || continuing) && (
              <span className="intro-resume">Tu proyecto sigue guardado: «{projectName}».</span>
            )}
          </>
        )}
      </section>
      <footer className="intro-footer">
        {screen > 0 ? (
          <button className="g-button quiet" onClick={() => move(screen - 1)}>
            <ArrowLeft size={17} />
            Atrás
          </button>
        ) : returning ? (
          <div className="intro-footer-start">
            <button className="g-button quiet" onClick={onFinish}>
              Continuar mi beat
            </button>
            <button className="g-button quiet" onClick={onRestart}>
              <RotateCcw size={16} />
              Reiniciar
            </button>
          </div>
        ) : (
          <span className="intro-footer-note">Tu primera idea empieza escuchando.</span>
        )}
        <button
          className="g-button primary"
          onClick={() => (screen === 2 ? onFinish() : move(screen + 1))}
        >
          {screen === 0
            ? 'Cómo vamos a crear'
            : screen === 1
              ? `Conocer a ${ASSISTANT.name}`
              : returning
                ? 'Volver a mi beat'
                : continuing
                  ? 'Continuar mi beat'
                  : 'Crear mi primera base'}
          <ArrowRight size={18} />
        </button>
      </footer>
    </main>
  );
}

function SparkleMark() {
  return <span aria-hidden="true">✦</span>;
}

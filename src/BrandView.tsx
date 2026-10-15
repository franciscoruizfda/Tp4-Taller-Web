import { useState } from 'react';
import { Palette, Download } from 'lucide-react';
import { download } from './files';

export default function BrandView() {
  const [logo, setLogo] = useState(0);
  const logos = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="#AD94FF"/><path d="M23 57V43M36 69V31M50 57V43M64 69V31M77 57V43" stroke="#15131F" stroke-width="9" stroke-linecap="round"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="#80D7B7"/><path d="M16 54H29L40 28L54 74L67 45L74 54H84" stroke="#15131F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="28" fill="#AD94FF"/><path d="M28 70V30L50 53L72 30V70" stroke="#15131F" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="72" r="5" fill="#15131F"/></svg>',
  ];
  return (
    <main className="brand-page">
      <div className="eyebrow">DIRECCIÓN VISUAL · PROPUESTA PARA REVISAR</div>
      <h1>Una marca que tiene ritmo.</h1>
      <p className="brand-intro">
        Tecnológica, cercana y con espacio para jugar. Esta es una primera propuesta para BeatMind;
        vos tenés la decisión final.
      </p>
      <div className="brand-hero">
        <img
          src={`data:image/svg+xml,${encodeURIComponent(logos[logo])}`}
          alt="Propuesta de símbolo BeatMind"
        />
        <div>
          <span className="brand-wordmark">
            beatmind<span>.</span>
          </span>
          <p>Tu primer beat empieza acá.</p>
        </div>
        <span className="proposal-tag">PROPUESTA 0{logo + 1}</span>
      </div>
      <section className="panel brand-section">
        <div className="section-label">
          <Palette size={19} />
          <h2>Oscuro, violeta y menta</h2>
        </div>
        <p>
          Una base tranquila para sesiones largas. Violeta para crear y menta para acompañar. Los
          instrumentos tienen colores propios, pero también etiquetas.
        </p>
        <div className="swatches">
          {[
            ['Fondo', '#111218'],
            ['Superficie', '#1B1C25'],
            ['Creatividad', '#AD94FF'],
            ['Acompañamiento', '#80D7B7'],
            ['Texto', '#F2F1F6'],
          ].map(([label, color]) => (
            <div key={color}>
              <span style={{ background: color }} />
              <strong>{label}</strong>
              <code>{color}</code>
            </div>
          ))}
        </div>
      </section>
      <div className="brand-columns">
        <section className="panel brand-section">
          <div className="eyebrow">TIPOGRAFÍA</div>
          <h2 className="type-sample">Space Grotesk</h2>
          <p>
            Para el logo, los títulos y los números grandes: geométrica, con personalidad y un aire
            musical.
          </p>
          <h3 className="inter-sample">Inter para lo cotidiano.</h3>
          <p>
            Para controles, explicaciones y textos pequeños. Las fuentes están incluidas en el
            proyecto para que no dependan de una conexión.
          </p>
          <span className="chip">Pesos 400 / 500 / 600 / 700</span>
        </section>
        <section className="panel brand-section">
          <div className="eyebrow">SÍMBOLO · TRES DIRECCIONES</div>
          <h2>¿Qué forma tiene BeatMind?</h2>
          <div className="logo-options">
            {logos.map((svg, i) => (
              <button
                key={i}
                aria-pressed={logo === i}
                className={logo === i ? 'selected' : ''}
                onClick={() => setLogo(i)}
              >
                <img src={`data:image/svg+xml,${encodeURIComponent(svg)}`} alt="" />
                <strong>{['Onda / M', 'Pulso', 'Monograma'][i]}</strong>
              </button>
            ))}
          </div>
          <p>
            {
              [
                'Una onda sonora con una M escondida: conecta música y nombre.',
                'Un latido continuo: una referencia al concepto original de Latido Studio.',
                'Una M clara y compacta: pensada para el icono de la aplicación.',
              ][logo]
            }
          </p>
          <button
            className="secondary-button"
            onClick={() =>
              download(
                new Blob([logos[logo]], { type: 'image/svg+xml' }),
                `beatmind-propuesta-${logo + 1}.svg`,
              )
            }
          >
            <Download size={15} /> Descargar propuesta SVG
          </button>
        </section>
      </div>
      <p className="brand-footnote">
        Elegir una opción acá sirve para previsualizarla. La identidad de marca todavía está
        pendiente de tu aprobación.
      </p>
    </main>
  );
}

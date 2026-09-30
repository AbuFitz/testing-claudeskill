import { useEffect, useRef } from 'react';
import Placeholder from './Placeholder.jsx';
import { prefersReducedMotion } from '../lib/env.js';
import { subscribe, passProgress, clamp } from '../lib/scroll.js';

// Three sentences, each kept whole on its own line so no article is stranded.
const sentences = [
  ['A\u00a0clean', 'line.'],
  ['A\u00a0steady', 'hand.'],
  ['A\u00a0chair', 'with\u00a0your', 'name\u00a0on\u00a0it.'],
];

export default function Manifesto() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    const spans = el.querySelectorAll('[data-w]');
    return subscribe(() => {
      const p = clamp((passProgress(el) - 0.22) / 0.4);
      spans.forEach((s, i) => {
        const o = clamp(p * (spans.length + 3) - i, 0, 1);
        s.style.setProperty('--o', o.toFixed(3));
      });
    });
  }, []);

  return (
    <section className="manifesto" ref={ref} aria-labelledby="manifesto-h">
      <p className="side" aria-hidden="true">
        LUTON / BEDFORDSHIRE
      </p>
      <h2 id="manifesto-h" className="manifesto__line">
        {sentences.map((words, si) => (
          <span key={si} className="manifesto__s">
            {words.map((w, i) => (
              <span key={i} data-w style={{ '--o': 1 }}>
                {w}{' '}
              </span>
            ))}
          </span>
        ))}
      </h2>
      <div className="manifesto__cols">
        <div>
          <p className="label">The shop</p>
          <Placeholder block>
            ABOUT: two or three sentences from the owner. Who cuts, how long the shop has been open, what it is known for.
          </Placeholder>
        </div>
        <div>
          <p className="label">The brief</p>
          <p className="manifesto__brief">Cuts. Fades. Beards. Shaves.</p>
          <Placeholder block>Confirm the full service list against the menu below.</Placeholder>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/env.js';
import { subscribe, pinnedProgress } from '../lib/scroll.js';

const plates = [
  { n: '01', label: 'Skin fade, side profile', cls: 'tall' },
  { n: '02', label: 'Beard line-up, close detail', cls: 'wide' },
  { n: '03', label: 'Scissor cut, top texture', cls: 'sq' },
  { n: '04', label: 'Hot towel shave', cls: 'tall' },
  { n: '05', label: 'The shop, front of house', cls: 'wide' },
];

export default function Work() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const mq = window.matchMedia('(max-width: 820px)');
    return subscribe(() => {
      const track = trackRef.current;
      if (!track) return;
      if (mq.matches) {
        track.style.transform = '';
        return;
      }
      const p = pinnedProgress(ref.current);
      const max = track.scrollWidth - window.innerWidth + 0;
      track.style.transform = `translate3d(${(-max * p).toFixed(1)}px,0,0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
    });
  }, []);

  return (
    <section id="work" className="work" ref={ref} aria-labelledby="work-h">
      <div className="work__stage">
        <header className="work__head">
          <h2 id="work-h" className="big">
            The work
          </h2>
          <p className="tag">
            <span>Photos needed</span>
            <span>Swipe / scroll</span>
          </p>
        </header>
        <div className="work__viewport" tabIndex={0} role="region" aria-label="Work gallery, scroll sideways">
          <ul className="work__track" ref={trackRef}>
            {plates.map((p) => (
              <li key={p.n} className={'plate plate--' + p.cls}>
                <div className="plate__img" role="img" aria-label={`Placeholder for photo ${p.n}: ${p.label}`}>
                  <span className="crop crop--tl" />
                  <span className="crop crop--tr" />
                  <span className="crop crop--bl" />
                  <span className="crop crop--br" />
                  <span className="plate__ph">[PHOTO SLOT]</span>
                </div>
                <p className="plate__cap">
                  <b>CUT {p.n}</b> [{p.label}. Client photo, with permission]
                </p>
              </li>
            ))}
            <li className="plate plate--note">
              <p className="label">Reviews</p>
              <p className="plate__big">None published yet.</p>
              <p className="ph ph--block">
                [Add real reviews here, with the customer&apos;s name and permission. Nothing has been invented.]
              </p>
            </li>
          </ul>
        </div>
        <div className="work__bar" aria-hidden="true">
          <i ref={barRef} />
        </div>
      </div>
    </section>
  );
}

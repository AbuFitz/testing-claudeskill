import { useEffect, useRef } from 'react';
import RazorScene from './RazorScene.jsx';
import { bookingTarget, phoneHref, site } from '../content/site.js';
import { prefersReducedMotion } from '../lib/env.js';
import { subscribe, pinnedProgress, clamp } from '../lib/scroll.js';

export default function Hero() {
  const ref = useRef(null);
  const stageRef = useRef(null);
  const target = bookingTarget();
  const tel = phoneHref();

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    return subscribe(() => {
      const el = ref.current;
      const stage = stageRef.current;
      if (!el || !stage) return;
      const p = pinnedProgress(el);
      // The cut opens between 8% and 70% of the pin; UI fades as it does.
      const gap = clamp((p - 0.08) / 0.62);
      stage.style.setProperty('--gp', gap.toFixed(4));
      stage.style.setProperty('--p', p.toFixed(4));
    });
  }, []);

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="hero__stage" ref={stageRef}>
        <div className="hero__title">
          <h1 className="sr-only">
            {site.name}: barbershop in {site.town}
          </h1>
          <div className="slit" aria-hidden="true">
            <span>{site.town.toUpperCase()}</span>
          </div>
          <div className="layer layer--top" aria-hidden="true">
            <span>BARBERS</span>
            <span>PRO</span>
          </div>
          <div className="layer layer--bottom" aria-hidden="true">
            <span>BARBERS</span>
            <span>PRO</span>
          </div>
        </div>

        <RazorScene heroRef={ref} />

        <div className="hero__ui">
          <p className="tag hero__tag">
            <span>Barbershop</span>
            <span>{site.town}</span>
          </p>
          <div className="hero__foot">
            <p className="hero__lede">
              Walk in tired.
              <br />
              Walk out sharp.
            </p>
            <div className="hero__cta">
              <a className="btn btn--red" href={target.href} {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                Book a chair
              </a>
              {tel ? (
                <a className="btn btn--line" href={tel}>
                  Call the shop
                </a>
              ) : (
                <a className="btn btn--line" href="#services">
                  See the menu
                </a>
              )}
            </div>
            <p className="hero__cue" aria-hidden="true">
              <i /> Scroll to close the blade
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

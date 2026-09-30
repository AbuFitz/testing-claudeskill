import { useEffect, useRef } from 'react';
import Placeholder from './Placeholder.jsx';
import { services } from '../content/site.js';

export default function Services() {
  const ref = useRef(null);
  useEffect(() => {
    const rows = ref.current.querySelectorAll('.row');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px' },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <section id="services" className="menu" aria-labelledby="menu-h" ref={ref}>
      <header className="menu__head">
        <h2 id="menu-h" className="big">
          The
          <br />
          menu
        </h2>
        <div className="menu__warn">
          <p>
            <strong>Draft menu.</strong> These are typical barbershop service names. The shop must confirm what it offers
            before launch.
          </p>
          <Placeholder block>PRICES AND TIMES: not supplied, shown as dashes</Placeholder>
        </div>
      </header>
      <ol className="ledger">
        {services.map((s, i) => (
          <li key={s.id} className="row">
            <span className="row__no">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="row__name">{s.name}</h3>
            <p className="row__note">{s.note}</p>
            <span className="row__lead" aria-hidden="true" />
            <span className="row__meta" title="Duration not confirmed">
              <span aria-hidden="true">-- min</span>
              <span className="sr-only">duration to be confirmed</span>
            </span>
            <span className="row__price" title="Price not confirmed">
              <span aria-hidden="true">£--</span>
              <span className="sr-only">price to be confirmed</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

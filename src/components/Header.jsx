import { useEffect, useState } from 'react';
import { bookingTarget, site } from '../content/site.js';

const links = [
  ['services', 'Menu'],
  ['work', 'Work'],
  ['book', 'Visit'],
];

export default function Header() {
  const [active, setActive] = useState('');
  const target = bookingTarget();

  useEffect(() => {
    const els = links.map(([id]) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => en.isIntersecting && setActive(en.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    const top = document.getElementById('top');
    const ioTop = new IntersectionObserver(([en]) => en.isIntersecting && setActive(''), { rootMargin: '-45% 0px -50% 0px' });
    top && ioTop.observe(top);
    return () => {
      io.disconnect();
      ioTop.disconnect();
    };
  }, []);

  return (
    <>
      <header className="nav">
        <a className="nav__mark" href="#top" aria-label={`${site.name}, back to top`}>
          BARBERS<b>PRO</b>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn btn--red nav__book" href={target.href} {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          Book a chair
        </a>
      </header>
      {/* Thumb-reach bar on small screens */}
      <nav className="dock" aria-label="Quick links">
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
            {label}
          </a>
        ))}
        <a className="dock__book" href={target.href} {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          Book
        </a>
      </nav>
    </>
  );
}

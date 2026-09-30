import { useEffect, useRef, useState } from 'react';
import RazorPoster from './RazorPoster.jsx';
import { prefersReducedMotion, saveData, hasWebGL } from '../lib/env.js';
import { subscribe, pinnedProgress } from '../lib/scroll.js';

// The 3D engine is an enhancement: code-split, loaded on idle, never blocks the offer.
export default function RazorScene({ heroRef }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('poster'); // poster | live

  useEffect(() => {
    if (saveData()) return undefined;
    const reduced = prefersReducedMotion();
    let scene = null;
    let cancelled = false;
    let unsub = () => {};
    let io = null;
    let onMove = null;

    const boot = async () => {
      try {
        const { createRazorScene } = await import('../scene/razor.js');
        if (cancelled || !canvasRef.current) return;
        scene = createRazorScene(canvasRef.current, {
          reducedMotion: reduced,
          onContextLost: () => setStatus('poster'),
        });
        setStatus('live');
        if (reduced) {
          scene.renderOnce();
          return;
        }
        unsub = subscribe(() => heroRef.current && scene.setProgress(pinnedProgress(heroRef.current)));
        io = new IntersectionObserver(([en]) => scene.setVisible(en.isIntersecting), { threshold: 0 });
        io.observe(heroRef.current);
        onMove = (e) => {
          if (e.pointerType === 'touch') return;
          scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        scene.start();
      } catch (err) {
        console.warn('3D scene unavailable, keeping poster', err);
        setStatus('poster');
      }
    };

    // Progressive enhancement: the poster is already a finished hero. Only once the
    // page has settled (first interaction, or a few seconds for a passive viewer) do
    // we probe for WebGL and fetch the engine, so neither touches first load.
    const triggers = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart', 'wheel'];
    let timer = 0;
    const untrigger = () => {
      triggers.forEach((t) => window.removeEventListener(t, go));
      clearTimeout(timer);
    };
    function go() {
      untrigger();
      const start = () => !cancelled && hasWebGL() && boot();
      window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1000 }) : setTimeout(start, 50);
    }
    triggers.forEach((t) => window.addEventListener(t, go, { passive: true }));
    timer = window.setTimeout(go, 6000);

    return () => {
      cancelled = true;
      untrigger();
      unsub();
      io && io.disconnect();
      onMove && window.removeEventListener('pointermove', onMove);
      scene && scene.dispose();
    };
  }, [heroRef]);

  return (
    <div className={'scene scene--' + status} aria-hidden={status === 'live' ? 'true' : undefined}>
      <RazorPoster />
      <canvas ref={canvasRef} className="scene__canvas" />
    </div>
  );
}

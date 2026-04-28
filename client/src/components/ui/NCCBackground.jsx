import { useEffect, useRef } from 'react';

/**
 * NCCBackground — Full-screen military animated background
 * • Parallax gradient shift on mouse move
 * • Floating particle dust (khaki/parchment)
 * • Fine grid overlay
 * • Corner chevrons
 * • Pulse glow
 */
const NCCBackground = ({ intensity = 1 }) => {
  const canvasRef   = useRef(null);
  const mouseRef    = useRef({ x: 0.5, y: 0.5 });
  const animRef     = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const particles = Array.from({ length: Math.floor(55 * intensity) }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.6 + 0.3,
      vx:    (Math.random() - 0.5) * 0.22,
      vy:   -(Math.random() * 0.35 + 0.08),
      alpha: Math.random() * 0.4 + 0.06,
      color: Math.random() > 0.55 ? '#c2b280' : '#e8efe6',
    }));

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const onMouse = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        // Subtle parallax drift toward cursor
        const dx = (mouseRef.current.x - 0.5) * 0.15;
        const dy = (mouseRef.current.y - 0.5) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        p.x += p.vx + dx * 0.004;
        p.y += p.vy + dy * 0.004;
        p.alpha += (Math.random() - 0.5) * 0.006;
        p.alpha  = Math.max(0.03, Math.min(0.52, p.alpha));

        if (p.y < -5)  p.y = H + 5;
        if (p.x < -5)  p.x = W + 5;
        if (p.x > W+5) p.x = -5;
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [intensity]);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      {/* Base military gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #141a13 0%, #1f2a1d 40%, #2e3b2c 70%, #1a2218 100%)',
      }} />

      {/* Slow radial pulse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 65% 55% at 18% 38%, rgba(212,175,55,0.07) 0%, transparent 68%), radial-gradient(ellipse 55% 65% at 82% 68%, rgba(46,59,44,0.45) 0%, transparent 68%)',
        animation: 'bgPulse 14s ease-in-out infinite alternate',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(194,178,128,0.035) 48px, rgba(194,178,128,0.035) 49px),
          repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(194,178,128,0.035) 48px, rgba(194,178,128,0.035) 49px)
        `,
      }} />

      {/* Corner chevrons */}
      {[
        { top: 20, left: 20, borderTop: true, borderLeft: true },
        { top: 20, right: 20, borderTop: true, borderRight: true },
        { bottom: 20, left: 20, borderBottom: true, borderLeft: true },
        { bottom: 20, right: 20, borderBottom: true, borderRight: true },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 36, height: 36,
          top:    s.top,
          left:   s.left,
          right:  s.right,
          bottom: s.bottom,
          borderTop:    s.borderTop    ? '1px solid rgba(194,178,128,0.2)' : 'none',
          borderLeft:   s.borderLeft   ? '1px solid rgba(194,178,128,0.2)' : 'none',
          borderRight:  s.borderRight  ? '1px solid rgba(194,178,128,0.2)' : 'none',
          borderBottom: s.borderBottom ? '1px solid rgba(194,178,128,0.2)' : 'none',
        }} />
      ))}

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      <style>{`
        @keyframes bgPulse {
          0%   { opacity: 0.65; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NCCBackground;

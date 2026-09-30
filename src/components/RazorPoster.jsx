// Designed static razor: used before WebGL loads and whenever 3D is unavailable,
// unwanted (data saver) or has failed (context loss).
export default function RazorPoster() {
  return (
    <svg className="poster" viewBox="0 0 760 300" role="img" aria-label="Illustration of an open straight razor with a red handle">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f1ea" />
          <stop offset=".45" stopColor="#9da3aa" />
          <stop offset=".55" stopColor="#dfe3e7" />
          <stop offset="1" stopColor="#6c727a" />
        </linearGradient>
        <linearGradient id="bake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2281c" />
          <stop offset=".5" stopColor="#8f1810" />
          <stop offset="1" stopColor="#5d0e09" />
        </linearGradient>
      </defs>
      <g transform="rotate(-6 380 150)">
        <path d="M380 128 L700 118 C735 118 748 146 720 172 L400 172 Z" fill="url(#steel)" />
        <path d="M400 168 L720 170" stroke="#fff" strokeWidth="1.5" opacity=".6" />
        <path d="M60 136 C40 136 34 168 60 170 L380 172 L380 128 Z" fill="url(#bake)" />
        <path d="M70 142 L370 146" stroke="#e8756a" strokeWidth="2" opacity=".5" />
        <circle cx="380" cy="150" r="17" fill="#c79a4a" />
        <circle cx="380" cy="150" r="6" fill="#0e0c0a" opacity=".6" />
      </g>
    </svg>
  );
}

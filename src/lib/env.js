export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const saveData = () => {
  const c = typeof navigator !== 'undefined' && navigator.connection;
  return !!(c && c.saveData);
};

// Software rasterisers (SwiftShader, llvmpipe) make a 3D hero janky and block the
// main thread. The designed poster is the better experience there.
// Append ?gl=force to the URL to override (used by the automated tests).
export function isSoftwareRenderer(gl) {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    return /swiftshader|llvmpipe|software|softpipe/i.test(name);
  } catch {
    return false;
  }
}

export function hasWebGL() {
  try {
    if (!window.WebGLRenderingContext) return false;
    const force = new URLSearchParams(window.location.search).get('gl') === 'force';
    const c = document.createElement('canvas');
    // failIfMajorPerformanceCaveat refuses a software context outright, which is
    // also far cheaper than creating one just to read its renderer name.
    const opts = force ? {} : { failIfMajorPerformanceCaveat: true };
    const gl = c.getContext('webgl2', opts) || c.getContext('webgl', opts);
    if (!gl) return false;
    const ok = force || !isSoftwareRenderer(gl);
    gl.getExtension('WEBGL_lose_context')?.loseContext(); // release the probe context
    return ok;
  } catch {
    return false;
  }
}

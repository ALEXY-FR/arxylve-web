// Render terminates HTTPS before forwarding requests to Next.js over HTTP.
// Never derive the allowed public origins from client-controlled proxy headers.
const publicOrigins = new Set([
  'https://arxylve-web.onrender.com',
  'https://arxylve.com',
  'https://www.arxylve.com',
]);

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin === 'null') return false;
  if (publicOrigins.has(origin)) return true;
  // Preserve direct local previews; this fallback is never used on Render.
  if (process.env.RENDER === 'true') return false;
  const target = new URL(request.url);
  return origin === target.origin && (
    process.env.NODE_ENV !== 'production' ||
    ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)
  );
}

export function secureAdminCookies(request: Request) {
  return process.env.NODE_ENV === 'production' || new URL(request.url).protocol === 'https:';
}

export function contentSecurityPolicy(nonce:string,development:boolean,local:boolean){
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development?" 'unsafe-eval'":''}`,
    // React styles, image fitting and the glass renderer use inline style attributes.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://arxylve.com https://arxylve-web.onrender.com",
    "media-src 'self' blob: https://arxylve.com https://arxylve-web.onrender.com",
    "font-src 'self' data:",
    `connect-src 'self'${development?' ws: wss:':''}`,
    "worker-src 'self' blob:",
    "object-src 'none'","base-uri 'none'","form-action 'self'",
    // Allow same-origin previews; block embedding by other websites.
    "frame-ancestors 'self'","frame-src 'self'",
    ...(!development&&!local?['upgrade-insecure-requests']:[]),
  ].join('; ');
}

export const securityHeaders=[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'SAMEORIGIN'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
  {key:'Strict-Transport-Security',value:'max-age=31536000'},
];

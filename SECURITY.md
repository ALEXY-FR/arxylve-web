# Security maintenance

Security remediation validated on 15 October 2026.

- Production dependencies: Next.js 16.4.1, sharp 0.35.5, React/React DOM 19.3.1, Nodemailer 10.1.1. The committed lockfile is the deployment source of truth. `npm audit --omit=dev` reports **zero vulnerabilities** as of this validation.
- Five audit entries remain in the development-only `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces` chain. They derive from [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm); the latest published braces version, 3.0.3, is affected and no patched version is available at validation time. This toolchain does not process public HTTP requests. Do not use a forced framework/config downgrade to hide these entries. Recheck when upstream releases a fix.
- Administrator access still requires both a password and an authorized device, or a valid short-lived invitation for pairing/setup. Password attempts have a separate 5-attempt/15-minute allowance per device or validated invitation. Unknown browsers cannot consume that allowance; the retired global 24-hour counter is ignored. Public traffic also cannot fill the bounded slots reserved for trusted admin attempts.
- JSON bodies are bounded while streaming, including requests with a missing or false Content-Length. Limits: contact 64 KiB, login/devices 4 KiB, contact status changes 1 KiB, content edits 2 MB. Uploads retain their existing separate streamed 80 MB limit, signature validation and single-conversion queue.
- Contact attempts are limited before parsing, and validated submissions have hourly/daily address budgets before DNS and SMTP. The two-pending-enquiries quota uses a private HttpOnly browser token, expires after seven days, and cannot be exhausted by someone merely claiming another visitor's email. Existing request history is retained; expiry affects the quota only. Failed email delivery releases its reservation.
- HTML responses carry a fresh, server-generated script nonce and an enforced Content Security Policy. Production disallows inline scripts without the nonce and JavaScript eval. Inline styles remain permitted for React layout and the glass effects. Same-origin framing remains permitted; third-party framing is blocked. HSTS (one year, without includeSubDomains), nosniff, referrer and permissions policies are set site-wide.

## Deployment assumptions

The limiter uses the private CMS disk and a process-local serialization queue, matching the current single-instance Render service. It trusts Render's Cloudflare client-address header only when `RENDER=true`, with the rightmost validated forwarded address as fallback. Outside Render it ignores client-supplied forwarding headers. Address identities are salted HMAC hashes rather than stored raw addresses. Expired limiter entries are removed during subsequent requests.

Before scaling to multiple workers or instances, move these limits to a shared transactional store; independent process caches cannot enforce a shared global allowance. Keep the private CMS/contact directories on the service's existing persistent disk. Do not expose their files through static hosting.

`ARXYLVE_CMS_DIR` and `CONTACT_STATE_DIR` allow isolated testing. Their defaults preserve the existing production storage paths. Tests must never point to the owner's real credentials or request history.

## Validation

Run `npm run test:security`, `npm run lint`, `npm run build`, and `npm audit --omit=dev` before release. The security suite uses temporary files, fake credentials and stubbed email/DNS; it sends no email and does not change production state.

Browser validation additionally covers public routes, protected API responses, fresh CSP nonces, a simulated injected script, the administration editor, client-side navigation, language selection and gallery image/video playback on mobile, tablet and desktop. These checks are a focused regression review and do not establish whether a past compromise occurred.

import { parsePhoneNumberFromString, isSupportedCountry, type CountryCode } from "libphonenumber-js/max";

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 160 || /[\s<>\r\n]/.test(email)) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.at(-1)!.length < 2 || !labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return null;
  return email;
}

export function normalizePhone(value: unknown, country: unknown = "FR"): string | null {
  if (typeof value !== "string" || value.length > 40) return null;
  if(typeof country!=="string"||!isSupportedCountry(country))return null;
  const raw = value.trim().replace(/^00/, "+");
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  try {
    const phone = parsePhoneNumberFromString(raw, { defaultCountry: country as CountryCode, extract: false });
    return phone?.isValid() && !phone.ext ? phone.number : null;
  } catch { return null; }
}

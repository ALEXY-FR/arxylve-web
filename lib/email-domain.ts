import { Resolver } from "node:dns/promises";

export async function emailDomainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  const resolver = new Resolver({ timeout: 2000, tries: 1 });
  try {
    const records = await resolver.resolveMx(domain);
    // A null MX explicitly means that this domain accepts no mail.
    if (records.length) return records.some(record => !!record.exchange && record.exchange !== ".");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND") return false;
    if (code !== "ENODATA") throw error;
  }
  // SMTP permits a mail host without an explicit MX when an address exists.
  const results = await Promise.allSettled([resolver.resolve4(domain), resolver.resolve6(domain)]);
  if (results.some(result => result.status === "fulfilled" && result.value.length > 0)) return true;
  const transient = results.find(result => result.status === "rejected" && !["ENODATA", "ENOTFOUND"].includes(result.reason?.code));
  if (transient?.status === "rejected") throw transient.reason;
  return false;
}

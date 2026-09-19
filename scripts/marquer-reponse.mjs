import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { markReplied } from '../lib/contact-store.mjs';

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
// Match the server's configured storage location when .env.local defines one.
if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const input = createInterface({ input: stdin, output: stdout });
try {
  const email = (await input.question('Adresse e-mail de la personne a laquelle vous avez repondu : ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Adresse e-mail invalide.');
  const confirmation = await input.question('Vous avez bien envoye votre reponse ? Tapez oui pour debloquer : ');
  if (confirmation.trim().toLowerCase() !== 'oui') { console.log('Aucune modification.'); }
  else { const count = await markReplied(email); console.log(count ? 'Demandes debloquees. Cette personne peut vous ecrire a nouveau.' : 'Aucune demande en attente pour cette adresse.'); }
} catch (error) { console.error('Operation non effectuee :', error.message); process.exitCode = 1; }
finally { input.close(); }

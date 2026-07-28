/**
 * Idempotent seed runner: the fixture language packs (text + phonetics; no
 * audio — Polly isn't run at seed). Clears every pack + phrase, then inserts the
 * seed set, so re-running converges to the same state. Signs in as an editor —
 * all writes go through userPool.
 *
 * Usage:
 *   npm run e2e-config   # ensure amplify_outputs.json exists (sandbox)
 *   npm run seed         # runs this script via tsx (needs .env.local creds)
 */
import { signIn, signOut } from 'aws-amplify/auth';
import { client, EDITOR_WRITE, clearOneModel } from './seedClient';
import { SEED_PACKS } from './fixtures/packs';
import { seedPacks, type SeedWriters } from './seedPacks';

async function main() {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) {
    throw new Error('TEST_USERNAME / TEST_PASSWORD required to seed (writes need an editor).');
  }
  await signOut().catch(() => {});
  await signIn({ username, password });

  const phrasesCleared = await clearOneModel(client.models.Phrase);
  const langsCleared = await clearOneModel(client.models.Language);
  await clearOneModel(client.models.GenerationRun);
  console.log(`Cleared ${langsCleared} languages, ${phrasesCleared} phrases.`);

  const writers: SeedWriters = {
    createLanguage: async (input) => {
      const { errors } = await client.models.Language.create(input, EDITOR_WRITE);
      if (errors) throw new Error(errors.map((e) => e.message).join('; '));
    },
    createPhrase: async (input) => {
      const { errors } = await client.models.Phrase.create(input, EDITOR_WRITE);
      if (errors) throw new Error(errors.map((e) => e.message).join('; '));
    },
  };
  const count = await seedPacks(SEED_PACKS, writers, new Date().toISOString());

  await signOut().catch(() => {});
  console.log(`Seed complete — ${count} packs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

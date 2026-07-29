<p align="center">
  <img src="assets/banner.png" alt="PhrasePack — talk like a local, anywhere" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/johnpc/phrasepack/actions/workflows/ci.yml"><img src="https://github.com/johnpc/phrasepack/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
</p>

# PhrasePack

**The essential travel phrases for any country — AI-generated, with correct spelling, phonetics, and spoken audio.** Pick a language and PhrasePack builds you a pocket phrasebook of the phrases you actually need on a trip: _hello_, _thank you_, _sorry — do you speak English?_, _the check, please_, _how much is it?_, _do you take cards?_, _I need a taxi_, _to the airport_, _where is the bathroom?_ … each one shown in the language's real spelling, with a simple pronunciation, and a **play** button that speaks it aloud.

**Play instantly as a guest — no account required.** Browse, open a pack, hear every phrase, and even generate a brand-new language, all without signing in.

## Screenshots

<p align="center">
  <img src="https://files.jpc.io/d/GpzNv-de-mobile.png" alt="A generated German pack on mobile — correct spelling, phonetics, and a play button per phrase" width="300" />
  &nbsp;&nbsp;
  <img src="https://files.jpc.io/d/ZtdRL-de-desktop.png" alt="The same German pack on desktop, in a centered reading column" width="480" />
</p>

<p align="center"><em>A German pack generated in-app — real spelling, phonetics, and spoken audio on every phrase.</em></p>

## Features

| Feature                                           | Status |
| ------------------------------------------------- | ------ |
| Browse your language packs                        | ✅     |
| Phrase list with correct spelling + phonetics     | ✅     |
| Search a pack by English, translation, or sound   | ✅     |
| Favorite phrases (pinned to the top, per device)  | ✅     |
| Tap a phrase to show it full-screen to a local    | ✅     |
| Share a pack with a travel companion              | ✅     |
| Tap-to-play spoken audio per phrase               | ✅     |
| Generate a pack for any language with AI (in-app) | ✅     |
| Refresh a pack to fill in newly-added key phrases | ✅     |
| Works offline for packs you've already opened     | ✅     |
| Light / dark / system theme                       | ✅     |
| Install as a PWA / iOS / Android app              | ✅     |

## How it works

PhrasePack is a thin **shell** (home, navigation, theme, the quality/CI rig) around a single content type — a **language pack** of key phrases. The interesting part is where the content comes from.

### Where the phrases come from

There's one **canonical catalog** of key travel phrases (`amplify/langgen/shared/phraseKeys.ts`) — the phrases every pack should contain, grouped into categories (Greetings, Money & Paying, Getting Around, Emergencies, …). The catalog carries a `KEY_VERSION`.

When you generate a language:

1. A **guest-callable** `generateLanguage` mutation kicks off an async worker and returns immediately.
2. The worker asks **Claude** (Bedrock, tool-forced structured output so the result is always a typed, validated array) to translate every catalog phrase into the target language — with correct spelling **and** a readable phonetic pronunciation.
3. For each phrase, **Amazon Polly** synthesizes the spoken audio in that language's voice and stores the MP3 in S3.
4. The phrases + audio are written straight to DynamoDB, and the pack flips to **Published**.

The whole thing takes about a minute; the app polls the generation run and drops you into the finished pack.

### Regenerating (the "new phrases" case)

Every pack records the `KEY_VERSION` it was built against. When the catalog grows — we add new key phrases — existing packs are now _missing_ those phrases. The app detects the gap (catalog slugs minus the pack's existing phrase slugs) and shows a **"New phrases available — Refresh"** banner. Refreshing runs `regenerateLanguage`, which translates and voices **only the missing phrases** (a cheap no-op if the pack is already current). Phrase ids are deterministic, so a refresh never duplicates what's already there.

## Architecture

- **Client:** Ionic 8 + React 19 + TypeScript (strict), Vite, Capacitor (iOS + Android).
- **Backend:** AWS Amplify Gen2 — Cognito (guest identity pool + an `editors` group for seeding), AppSync (GraphQL), DynamoDB, S3.
- **AI:** Bedrock **Claude Haiku 4.5** for translations + phonetics (tool-forced), **Amazon Polly** (neural) for audio.
- **Generation pipeline:** a starter resolver (find-or-create the pack, kick off the worker) → an async worker Lambda (Claude → Polly → S3 + DynamoDB). Lambdas write directly to DynamoDB via their IAM roles.

Guest reads "just work" because every read model grants `allow.guest()` and the client defaults to the identity-pool auth mode; editor writes (the seed) sign in and use the user-pool mode.

## Download / install

- **PWA:** open the site in your browser and choose _Add to Home Screen_ / _Install_.
- **iOS:** TestFlight link — _coming soon_.
- **Android:** grab the debug APK from the latest [GitHub Release](https://github.com/johnpc/phrasepack/releases).

## Development

```bash
npm install
npm run dev            # Vite dev server
npm run quality        # full local gate: lint + format + check:lines + check:features + coverage + crap + build
npm run test:e2e       # Gherkin acceptance tests (bddgen + Playwright)
npm run seed           # seed the sandbox with starter packs (needs editor creds in .env.local)
npm run e2e-config     # pull amplify_outputs.json from the sandbox stack
npx ampx sandbox       # personal cloud backend sandbox
```

Quality gates (enforced by husky pre-commit **and** CI): no `any`, every logic file ≤ 100 lines, ≥ 80% test coverage, CRAP ≤ 15 per function, Gherkin acceptance via Playwright, Prettier-clean, and a green build.

## License

MIT

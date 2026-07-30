// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// Give jsdom a working IndexedDB so the offline audio cache is exercised in
// tests (jsdom has none natively).
import 'fake-indexeddb/auto';
import { Blob as NodeBlob } from 'node:buffer';
import { configure } from '@testing-library/react';
import { beforeEach } from 'vitest';

// jsdom's Blob lacks .arrayBuffer() and doesn't structured-clone into
// fake-indexeddb; node's Blob is spec-compliant on both counts. Use it so the
// audio-cache round-trip behaves like a real browser under test.
globalThis.Blob = NodeBlob as unknown as typeof Blob;

// Raise the default async timeout so waitFor assertions don't flake under the
// CPU contention of the pre-commit hook / CI (build + tests running together).
configure({ asyncUtilTimeout: 5000 });

// Isolate localStorage between tests: several play screens read/write the daily
// play-once store, so a "solved" case in one test would otherwise leak into the
// next (e.g. tripping the daily guard). Clear it before every test.
beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom without storage — nothing to clear */
  }
});

// Mock matchmedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

import '@testing-library/jest-dom';

if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...(globalThis.crypto ?? {}),
    randomUUID: () => Math.random().toString(36).slice(2, 10),
  } as Crypto;
}

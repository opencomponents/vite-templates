import { describe, expect, it } from 'vitest';

import { getShadowRoot } from './renderer.js';

// Minimal DOM-ish fake so the shadow-root resolution can be exercised without
// pulling in a full DOM environment.
function elementWithRoot(rootNode: unknown): Node {
  return { getRootNode: () => rootNode } as unknown as Node;
}

describe('getShadowRoot', () => {
  it('returns null when the node is in the light DOM (Document root)', () => {
    const documentRoot = { nodeType: 9 }; // DOCUMENT_NODE
    expect(getShadowRoot(elementWithRoot(documentRoot))).toBeNull();
  });

  it('returns the shadow root when the node lives inside one', () => {
    const shadowRoot = { nodeType: 11, host: {} };
    expect(getShadowRoot(elementWithRoot(shadowRoot))).toBe(shadowRoot);
  });

  it('does not treat a plain DocumentFragment (no host) as a shadow root', () => {
    const fragment = { nodeType: 11 }; // no `host`
    expect(getShadowRoot(elementWithRoot(fragment))).toBeNull();
  });

  it('returns null when getRootNode is unavailable', () => {
    expect(getShadowRoot({} as unknown as Node)).toBeNull();
  });
});

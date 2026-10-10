import { describe, it, expect } from 'vitest';
import { render } from '@remix-run/component/test';

import App from './App';

describe('App - Page', () => {
  it('renders the fun fact button', async () => {
    // Seed the initial data the same way server-side rendering does.
    (globalThis as any).__$$oc_initialData__ = {
      firstName: 'firstName',
      lastName: 'Doe',
      born: 1991,
      hobbies: [],
    };
    try {
      const view = render(<App />);
      await view.act(() => {});
      expect(view.$('button')?.textContent).toMatch(/Fun year fact/i);
      view.cleanup();
    } finally {
      delete (globalThis as any).__$$oc_initialData__;
    }
  });
});

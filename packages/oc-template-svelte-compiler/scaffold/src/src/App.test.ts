import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';

import App from './App.svelte';

describe('App - Page', () => {
  it('renders the fun fact button', () => {
    const { body } = render(App, {
      props: {
        firstName: 'firstName',
        lastName: 'Doe',
        born: 1991,
        hobbies: [],
      },
    });

    expect(body).toMatch(/Fun year fact/i);
  });
});

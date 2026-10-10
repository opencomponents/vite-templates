import React from 'react';
import { describe, it, afterEach, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App - Page', () => {
  beforeEach(() => {
    window.oc = { events: { on: vi.fn(), fire: vi.fn() } } as any;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Gets more data when clicking the button', () => {
    render(
      <App
        firstName="firstName"
        lastName="lastName"
        born={1991}
        hobbies={[]}
      />
    );

    const extraInfoButton = screen.getByText(/Fun year fact/i);
    expect(extraInfoButton).toBeTruthy();
  });
});

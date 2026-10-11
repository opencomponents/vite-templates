import { describe, it, afterEach, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';

import App from './App';

describe('App - Page', () => {
  beforeEach(() => {
    window.oc = { events: { on: vi.fn(), fire: vi.fn() } } as any;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Gets more data when clicking the button', () => {
    render(<App name="firstName" year={1991} />);

    const extraInfoButton = screen.getByText(/Fun year fact/i);
    expect(extraInfoButton).toBeTruthy();
  });
});

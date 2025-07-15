import { describe, it, afterEach, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/vue';

import App from './App.vue';

const getData = vi.fn();
const getSetting = vi.fn();

describe('App - Page', () => {
  beforeEach(() => {
    window.oc = { events: { on: vi.fn(), fire: vi.fn() } } as any;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Gets more data when clicking the button', () => {
    getData.mockImplementationOnce(() => Promise.resolve({}));
    getSetting.mockImplementationOnce(() => ({}));
    render(App, {
      props: {
        firstName: 'firstName',
        lastName: 'lastName',
        born: 1991,
        hobbies: [],
      },
      global: {
        provide: {
          dataProvider: {
            firstName: 'firstName',
            lastName: 'lastName',
            userId: 0,
            getData,
            getSetting,
          },
        },
      },
    });

    const extraInfoButton = screen.getByText(/Fun year fact/i);
    expect(extraInfoButton).toBeTruthy();
  });
});

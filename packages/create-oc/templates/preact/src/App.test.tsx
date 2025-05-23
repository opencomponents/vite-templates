import { describe, it, afterEach, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataProvider } from 'oc-template-preact-compiler/dist/utils/useData';

import App from './App';

const getData = vi.fn();

describe('App - Page', () => {
  beforeEach(() => {
    window.oc = { events: { on: vi.fn(), fire: vi.fn() } } as any;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Gets more data when clicking the button', () => {
    getData.mockImplementationOnce(() => Promise.resolve({}));
    render(
      <DataProvider
        value={{
          firstName: 'firstName',
          lastName: 'lastName',
          userId: 0,
          getData,
        }}
      >
        <App
          firstName="firstName"
          lastName="lastName"
          born={1991}
          hobbies={[]}
        />
      </DataProvider>
    );

    const extraInfoButton = screen.getByText(/Fun year fact/i);
    expect(extraInfoButton).toBeTruthy();
  });
});

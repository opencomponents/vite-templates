import React from 'react';
import { describe, it, afterEach, beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataProvider } from 'oc-template-react-compiler/utils/useData';

import App from './App';

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
    render(
      <DataProvider
        value={{
          firstName: 'firstName',
          lastName: 'lastName',
          userId: 0,
          getData,
          getSetting
        }}
      >
        <App firstName="firstName" lastName="lastName" userId={0} />
      </DataProvider>
    );

    const extraInfoButton = screen.getByText(/Get extra information/i);
    expect(extraInfoButton).toBeTruthy();
  });
});

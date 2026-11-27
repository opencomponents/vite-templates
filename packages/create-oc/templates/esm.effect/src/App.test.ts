import { HtmlLocator, HtmlScene } from '@effect/ui/html/testing';
import { it } from '@effect/vitest';
import { Effect } from 'effect';

import { App } from './App';

it.effect('renders the initial greeting and fun fact button', () =>
  Effect.gen(function* () {
    const scene = yield* HtmlScene.make(App, {
      name: 'Jane Doe',
      year: 1991,
    });

    scene
      .expect(HtmlLocator.role('heading', { name: 'Hello, Jane Doe' }))
      .toExist()
      .expect(HtmlLocator.role('button', { name: 'Fun year fact' }))
      .toExist();
  })
);

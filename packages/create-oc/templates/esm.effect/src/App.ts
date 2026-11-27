import { Command, UiSchema } from '@effect/ui';
import { Html } from '@effect/ui/html';
import { Effect, Schema } from 'effect';
import { serverClient } from 'oc-server/client';
import styles from './styles.module.css';
import logo from '../public/logo.png';

export const AppMessage = UiSchema.TaggedEnum({
  ClickedGetFunFact: {},
  CompletedGetFunFact: { funFact: Schema.String },
  FailedGetFunFact: { error: Schema.String },
});

// Commands describe client-side effects as values. The runtime tracks this
// one while it runs, which lets the view derive its loading state.
export const GetFunFact = Command.make(
  'GetFunFact',
  { args: { year: Schema.Number }, mode: 'switch' },
  ({ year }) =>
    Effect.tryPromise({
      try: (signal) => serverClient.funFact({ year }, { signal }),
      catch: (error) =>
        error instanceof Error ? error.message : String(error),
    }).pipe(
      Effect.match({
        onSuccess: ({ funFact }) => AppMessage.CompletedGetFunFact({ funFact }),
        onFailure: (error) => AppMessage.FailedGetFunFact({ error }),
      })
    )
);

export const App = Html.component({
  name: 'App',
  props: Schema.Struct({
    name: Schema.String,
    year: Schema.Number,
  }),
  model: Schema.Struct({
    fact: Schema.NullOr(Schema.String),
    error: Schema.String,
  }),
  message: AppMessage,
}).make({
  init: () => ({ fact: null, error: '' }),
  update: {
    ClickedGetFunFact: ($) =>
      $.evolve({ error: '' }).run(GetFunFact.make({ year: $.props.year })),
    CompletedGetFunFact: ($, { funFact }) =>
      $.evolve({ fact: funFact, error: '' }),
    FailedGetFunFact: ($, { error }) => $.evolve({ error }),
  },
  view: (h, model) =>
    h.div.class(styles.container).children(
      h.div.class(styles.card).children(
        h.div.class(styles.brand).children(
          // Static assets are imported from ../public/
          h.img
            .attrs({
              src: logo,
              width: '40',
              height: '40',
              alt: 'Logo',
            })
            .class(styles.logo),
          h.p.class(styles.eyebrow).children('OpenComponents · Vite')
        ),
        h.h1
          .class(styles.title)
          .children(
            'Hello, ',
            h.span.class(styles.name).children(h.props.name)
          ),
        h.p
          .class(styles.subtitle)
          .children(
            'Born in ',
            h.span.class(styles.pill).children(String(h.props.year))
          ),
        model.fact === null
          ? null
          : h.div.class(styles.fact).children(model.fact),
        model.error === ''
          ? null
          : h.div.class(styles.error).children(model.error),
        h.button
          .attr('type', 'button')
          .class(styles.button)
          .disabled(h.isRunning(GetFunFact))
          .on('click', AppMessage.ClickedGetFunFact())
          .children(h.isRunning(GetFunFact) ? 'Loading…' : 'Fun year fact')
      )
    ),
});

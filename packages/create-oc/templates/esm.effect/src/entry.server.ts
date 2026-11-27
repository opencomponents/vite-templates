import { Server } from 'oc-server';

// Small lookup for the action below. Kept tiny on purpose: it only shows
// that an action receives input and returns data.
const funFacts: Record<number, string> = {
  1986: "Halley's Comet made its closest approach to Earth in 1986.",
  1991: 'The first web page was created in 1991 by Tim Berners-Lee.',
};

// Tip: `new Server({ stream: true })` lets handlers and actions return
// Promises that resolve on the client instead of blocking the render.
export const server = new Server({
  development: {
    // Stream browser console logs to the terminal during `npm start`
    console: true,
  },
})
  // Parameters become URL query strings, e.g. `?name=Ada&year=1986`
  .withParameters({
    name: {
      default: 'Jane Doe',
      description: 'Who to greet',
      example: 'Jane Doe',
      type: 'string',
    },
    year: {
      default: 1991,
      description: 'Birth year used for the fun fact',
      example: 1991,
      type: 'number',
    },
  })
  // Runs once per render. Its return value becomes the UI props.
  .handler(async ({ name = 'Jane Doe', year = 1991 }) => {
    return { name: name.trim() || 'Jane Doe', year };
  })
  // Runs on demand from the browser via `serverClient.funFact({ year })`
  .action('funFact', async ({ year }: { year: number }) => {
    return {
      funFact: funFacts[year] ?? `No fun fact available for year ${year}`,
    };
  });

// Enables type-safe props and actions on the client
declare module 'oc-server' {
  interface Register {
    server: typeof server;
  }
}

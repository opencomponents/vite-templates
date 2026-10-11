import { createSignal, Show } from 'solid-js';
import {
  serverClient,
  type InitialData,
  type ActionOutput,
} from 'oc-server/client';
import styles from './styles.css';
import logo from '../public/logo.png';

type FunFact = ActionOutput<'funFact'>;

const App = (props: InitialData) => {
  // These come from the server.ts handler return value
  const [fact, setFact] = createSignal<FunFact | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  async function getFunFact() {
    setLoading(true);
    setError('');
    try {
      // Call the server action with type safety
      setFact(await serverClient.funFact({ year: props.year }));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class={styles.container}>
      <div class={styles.card}>
        <div class={styles.brand}>
          {/* Static assets are imported from ../public/ */}
          <img
            class={styles.logo}
            width="40"
            height="40"
            src={logo}
            alt="Logo"
          />
          <p class={styles.eyebrow}>OpenComponents · Vite</p>
        </div>
        <h1 class={styles.title}>
          Hello, <span class={styles.name}>{props.name}</span>
        </h1>
        <p class={styles.subtitle}>
          Born in <span class={styles.pill}>{props.year}</span>
        </p>
        <Show when={fact()}>
          <div class={styles.fact}>{fact()!.funFact}</div>
        </Show>
        <Show when={error()}>
          <div class={styles.error}>{error()}</div>
        </Show>
        <button
          class={styles.button}
          onClick={getFunFact}
          disabled={loading()}
        >
          {loading() ? 'Loading…' : 'Fun year fact'}
        </button>
      </div>
    </div>
  );
};

export default App;

import {
  serverClient,
  type ActionOutput,
  getInitialData,
} from 'oc-server/client';
import { on, type Handle } from '@remix-run/component';
import styles from './styles.module.css';
import logo from '../public/logo.png';

type FunFact = ActionOutput<'funFact'>;

export default function App(handle: Handle) {
  // This comes from the entry.server.ts handler return value
  const { name, year } = getInitialData();
  let fact: FunFact | null = null;
  let loading = false;
  let error = '';

  const getFunFact = async () => {
    loading = true;
    error = '';
    handle.update();
    try {
      // Call the server action with type safety
      fact = await serverClient.funFact({ year });
    } catch (err) {
      error = String(err);
    } finally {
      loading = false;
      handle.update();
    }
  };

  return () => (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          {/* Static assets are imported from ../public/ */}
          <img
            className={styles.logo}
            width="40"
            height="40"
            src={logo}
            alt="Logo"
          />
          <p className={styles.eyebrow}>OpenComponents · Vite</p>
        </div>
        <h1 className={styles.title}>
          Hello, <span className={styles.name}>{name}</span>
        </h1>
        <p className={styles.subtitle}>
          Born in <span className={styles.pill}>{year}</span>
        </p>
        <p className={styles.hint}>
          Press the button to fetch a fun fact about that year from the
          server.
        </p>
        {fact && <div className={styles.fact}>{fact.funFact}</div>}
        {error && <div className={styles.error}>{error}</div>}
        <button
          className={styles.button}
          mix={[on<HTMLButtonElement>('click', getFunFact)]}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Fun year fact'}
        </button>
      </div>
    </div>
  );
}

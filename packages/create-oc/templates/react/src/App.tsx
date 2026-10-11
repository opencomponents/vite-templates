import { useState } from 'react';
import {
  serverClient,
  type InitialData,
  type ActionOutput,
} from 'oc-server/client';
import styles from './styles.css';
import logo from '../public/logo.png';

type FunFact = ActionOutput<'funFact'>;

const App: React.FC<InitialData> = (props: InitialData) => {
  // These come from the server.ts handler return value
  const { name, year } = props;
  const [fact, setFact] = useState<FunFact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getFunFact = async () => {
    setLoading(true);
    setError('');
    try {
      // Call the server action with type safety
      setFact(await serverClient.funFact({ year }));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
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
          onClick={getFunFact}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Fun year fact'}
        </button>
      </div>
    </div>
  );
};

// Default export is required for OC build process
export default App;

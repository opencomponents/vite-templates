import { useState } from 'react';
import {
  serverClient,
  type InitialData,
  type ActionOutput,
} from 'oc-server/client';
import styles from './styles.css';
import logo from '../public/logo.png';

type AdditionalData = ActionOutput<'funFact'>;

const App: React.FC<InitialData> = (props: InitialData) => {
  // These come from the server.ts handler return value
  const { firstName, lastName, born, hobbies } = props;
  const [additionalData, setAdditionalData] = useState<AdditionalData | null>(
    null
  );
  const [error, setError] = useState('');

  const getFunFact = async () => {
    setError('');
    try {
      // Call server action with type safety
      // serverClient provides autocomplete and type checking
      const data = await serverClient.funFact({ year: born });
      setAdditionalData(data);
    } catch (err) {
      setError(String(err));
    }
  };

  if (error) {
    return <div>Something wrong happened!</div>;
  }

  return (
    <div className={styles.container}>
      {/* Static assets are imported from ../public/ */}
      <img width="50" height="50" src={logo} alt="Logo" />
      <h1 style={{ margin: '0 0 20px 0' }}>
        Hello, <span style={{ textDecoration: 'underline' }}>{firstName}</span>{' '}
        {lastName}
      </h1>
      <div className={styles.info}>
        <div className={styles.block}>Born: {born}</div>
        <div className={styles.block}>
          Hobbies: {hobbies.map((x) => x.toLowerCase()).join(', ')}
        </div>
      </div>
      {additionalData && <div>{additionalData.funFact}</div>}
      <button className={styles.button} onClick={getFunFact}>
        Fun year fact
      </button>
    </div>
  );
};

// Default export is required for OC build process
export default App;

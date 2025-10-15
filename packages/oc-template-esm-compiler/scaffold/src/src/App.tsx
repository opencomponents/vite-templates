import { serverClient, type ActionOutput, getInitialData } from 'oc-server';
import type { Remix } from '@remix-run/dom';
import { press } from '@remix-run/events/press';
import styles from './styles.module.css';
import logo from '../public/logo.png';

type AdditionalData = ActionOutput<'funFact'>;

export default function App(this: Remix.Handle) {
  const { firstName, lastName, born, hobbies } = getInitialData();
  let additionalData: AdditionalData | null = null;
  let error = '';

  const getFunFact = async () => {
    error = '';
    try {
      const data = await serverClient.funFact({ year: born });
      additionalData = data;
    } catch (err) {
      error = String(err);
    } finally {
      this.update();
    }
  };

  if (error) {
    return <div>Something wrong happened!</div>;
  }

  return () => (
    <div className={styles.container}>
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
      <button className={styles.button} on={press(getFunFact)}>
        Fun year fact
      </button>
    </div>
  );
}

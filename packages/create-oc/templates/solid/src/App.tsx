import { createSignal, Show } from 'solid-js';
import {
  serverClient,
  type InitialData,
  type ActionOutput,
} from 'oc-server/client';
import styles from './styles.css';
import logo from '../public/logo.png';

type AdditionalData = ActionOutput<'funFact'>;

const App = (props: InitialData) => {
  const { firstName, lastName, born, hobbies } = props;
  const [additionalData, setAdditionalData] =
    createSignal<AdditionalData | null>(null);
  const [error, setError] = createSignal('');

  async function handleClick() {
    const data = await serverClient.funFact({ year: born });

    try {
      setAdditionalData(data);
    } catch (error) {
      setError(String(error));
    }
  }

  return (
    <Show when={!error()} fallback={<div>Something wrong happened!</div>}>
      <div class={styles.container}>
        <img width="50" height="50" src={logo} alt="Logo" />
        <h1 style={{ margin: '0 0 20px 0' }}>
          Hello,{' '}
          <span style={{ 'text-decoration': 'underline' }}>{firstName}</span>{' '}
          {lastName}
        </h1>
        <div class={styles.info}>
          <div class={styles.block}>Born: {born}</div>
          <div class={styles.block}>
            Hobbies: {hobbies.map((x) => x.toLowerCase()).join(', ')}
          </div>
        </div>
        <Show when={additionalData()}>
          <div>{additionalData()!.funFact}</div>
        </Show>
        <button class={styles.button} onClick={handleClick}>
          Fun year fact
        </button>
      </div>
    </Show>
  );
};

export default App;

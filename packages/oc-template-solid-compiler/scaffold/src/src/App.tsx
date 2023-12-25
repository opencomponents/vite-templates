import { createSignal, Show, For } from 'solid-js';
import { useData } from 'oc-template-solid-compiler/dist/utils/useData';
import { serverClient } from 'oc-server';
import styles from './styles.css';
import type { AdditionalData, ClientProps } from './types';

interface AppProps extends ClientProps {
  getMoreData?: boolean;
}

const App = () => {
  const { firstName, lastName, userId, getSetting } = useData<AppProps>();
  const staticPath = getSetting('staticPath');
  const [additionalData, setAdditionalData] = createSignal<AdditionalData | null>(null);
  const [error, setError] = createSignal('');

  async function handleClick() {
    const data = await serverClient.getMoreData({ userId });

    try {
      setAdditionalData(data);
    } catch (error) {
      setError(String(error));
    }
  }

  return (
    <Show when={!error()} fallback={<div>Something wrong happened!</div>}>
      <div class={styles.container}>
        <img width="50" height="50" src={`${staticPath}/public/logo.png`} alt="Logo" />
        <h1 style={{ margin: '0 0 20px 0' }}>
          Hello, <span style={{ 'text-decoration': 'underline' }}>{firstName}</span> {lastName}
        </h1>
        <Show when={!!additionalData()}>
          <div class={styles.info}>
            <div class={styles.block}>Age: {additionalData()!.age}</div>
            <div class={styles.block}>
              Hobbies: <For each={additionalData()!.hobbies}>{(hobby) => <div>{hobby}</div>}</For>
            </div>
          </div>
        </Show>
        <button class={styles.button} onClick={handleClick}>
          Get extra information
        </button>
      </div>
    </Show>
  );
};

export default App;

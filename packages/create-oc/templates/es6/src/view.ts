import { InitialData, serverClient } from 'oc-server';
import styles from './styles.css';
import logo from '../public/logo.png';

declare const window: Window & {
  fetchMoreData: () => Promise<void>;
};

export default ({ firstName, lastName, hobbies, born }: InitialData) => {
  window.fetchMoreData = async () => {
    const { funFact } = await serverClient.funFact({ year: born });
    document.querySelector('#funfact')!.innerHTML = funFact;
  };

  return /* html */ `
    <div class="${styles.container}">
      <img width="50" height="50" src="${logo}" alt="Logo" />
      <h1 style="margin: 0 0 20px 0;">
        Hello, <span style="text-decoration: underline;">${firstName}</span> ${lastName}
      </h1>
      <div class=${styles.info}>
        <div class=${styles.block}>Born: ${born}</div>
        <div class=${styles.block}>
          <div>Hobbies: ${hobbies.map((x) => x.toLowerCase()).join(', ')}</div>
        </div>
      </div>
      <div id="funfact"></div>
      <button class=${styles.button} onclick="fetchMoreData()">
        Fun year fact
      </button>
    </div>
  `;
};

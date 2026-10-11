import { InitialData, serverClient, getSettings } from 'oc-server/client';
import styles from './styles.css';
import logo from '../public/logo.png';

const onRender = (cb: (element: HTMLElement) => void) => {
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    const { id } = getSettings();
    window.oc.events.on('oc:rendered', (e, data) => {
      if (String(data.id) === id) {
        cb(data.element);
      }
    });
  }
};

export default ({ name, year }: InitialData) => {
  onRender((element) => {
    const button = element.querySelector(
      `.${styles.button}`
    ) as HTMLButtonElement | null;
    button?.addEventListener('click', async () => {
      const target = element.querySelector('#fun-year-fact')!;
      button.disabled = true;
      button.textContent = 'Loading…';
      try {
        // Call the server action
        const { funFact } = await serverClient.funFact({ year });
        target.className = styles.fact;
        target.textContent = funFact;
      } catch (err) {
        target.className = styles.error;
        target.textContent = String(err);
      } finally {
        button.disabled = false;
        button.textContent = 'Fun year fact';
      }
    });
  });

  return /* html */ `
    <div class="${styles.container}">
      <div class="${styles.card}">
        <div class="${styles.brand}">
          <img class="${styles.logo}" width="40" height="40" src="${logo}" alt="Logo" />
          <p class="${styles.eyebrow}">OpenComponents · Vite</p>
        </div>
        <h1 class="${styles.title}">Hello, <span class="${styles.name}">${name}</span></h1>
        <p class="${styles.subtitle}">Born in <span class="${styles.pill}">${year}</span></p>
        <p class="${styles.hint}">Press the button to fetch a fun fact about that year from the server.</p>
        <div id="fun-year-fact"></div>
        <button class="${styles.button}">
          Fun year fact
        </button>
      </div>
    </div>
  `;
};

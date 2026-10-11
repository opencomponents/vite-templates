import { serverClient } from 'oc-server/client';
import { Elm } from './Main.elm';

export default {
  js: (app) => {
    app.ports.askFunFact.subscribe(async (params) => {
      try {
        const data = await serverClient.funFact(params);
        app.ports.getFunFact.send({ funFact: data.funFact, error: '' });
      } catch (err) {
        app.ports.getFunFact.send({ funFact: '', error: String(err) });
      }
    });
  },
  program: Elm.Main,
};

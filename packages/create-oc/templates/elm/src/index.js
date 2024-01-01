import { serverClient } from 'oc-server';
import { Elm } from './Main.elm';

export default {
  js: (app) => {
    app.ports.askFunFact.subscribe(async (params) => {
      const data = await serverClient.funFact(params);
      app.ports.getFunFact.send(data);
    });
  },
  program: Elm.Main,
};

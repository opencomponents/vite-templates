import { getInitialData, getSettings } from 'oc-server/client';

let mounts = 0;

export default {
  mount(element) {
    mounts++;
    // Read after mount returns, as a React render or an effect would.
    queueMicrotask(() => {
      element.result = {
        name: getInitialData().name,
        id: getSettings().id,
        mounts,
      };
    });
  },
};

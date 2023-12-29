# WORK IN PROGRESS [NOT READY FOR PRODUCTION]

# oc-template-elm

[Elm](https://elm-lang.org) template for the [OpenComponents](https://github.com/opentable/oc) template system

---

## Ports

Your Elm component will have access to two ports by default, if you want to use them.

```elm
-- To do a oc.getData request passing your properties
port getData : E.Value -> Cmd msg

-- A listener after the oc.getData request finishes. It will be up to you to decode errors you may get.
port dataReceiver : (E.Value -> msg) -> Sub msg
```

## Custom ports

So what can you do if you want to have extra custom ports? (Maybe to listen to OC events). In that case you can point your entry as a javascript file.

```json
{
  "oc": {
    "files": {
      "data": "src/server.ts",
      "template": {
        "src": "src/index.js",
        "type": "oc-template-elm"
      }
    }
  }
}
```

Then, on that file, just `export default` an object that will take two parameters: `program` with your Elm main program and `js` with a function that takes the elm app as a parameter where you can set whatever you want

```js
/// src/index.js
import { Elm } from "./Main.elm";

export default {
  js: (app) => {
    window.oc.events.on("myEvent", (event) => {
      // Elm will get event data on that port!
      app.ports.myPortReceiver.send(event.data);
    });
  },
  program: Elm.Main,
};
```

## Missing features

- Server side rendering

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

So what can you do if you want to have extra custom ports? (Maybe to listen to OC events). In that case you can use an additional optional property in the OC object to point to a JavaScript (or TypeScript) file, inside the files property.

```json
{
  "oc": {
    "files": {
      "data": "src/server.ts",
      "template": {
        "src": "src/Main.elm",
        // You don't have to define this one if not needed.
        "js": "src/custom.js",
        "type": "oc-template-elm"
      }
    }
  }
}
```

Then, on that file, just `export default` a function that will take your Elm `app` as a parameter, like so:

```js
/// src/custom.js

export default (app) => {
  window.oc.events.on('myEvent', (event) => {
    // Elm will get event data on that port!
    app.ports.myPortReceiver.send(event.data);
  });
};
```

## Missing features

- Server side rendering

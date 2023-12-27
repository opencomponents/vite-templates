import Cache from 'nice-cache';

const cache = new Cache({});

export default function tryGetCached(
  type: string,
  key: string,
  predicate: (cb: (err: Error | null, data: any) => void) => void,
  callback: (err: Error | null, data?: any) => void
) {
  const cached = cache.get(type, key);

  if (cached) {
    return callback(null, cached);
  }

  predicate((err, res) => {
    if (err) {
      return callback(err);
    }

    cache.set(type, key, res);
    callback(null, res);
  });
}

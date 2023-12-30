import Cache from 'nice-cache';

const cache = new Cache({});

export default async function tryGetCached(
  type: string,
  key: string,
  predicate: () => Promise<any>
) {
  const cached = cache.get(type, key);

  if (cached) {
    return cached;
  }

  const data = await predicate();
  cache.set(type, key, data);

  return data;
}

import { Server } from 'oc-server';
import { AdditionalData, ClientProps, OcParameters } from './types';

const database = [
  { name: 'John Doe', age: 34, hobbies: ['Swimming', 'Basketball'] },
  { name: 'Jane Doe', age: 35, hobbies: ['Running', 'Rugby'] }
];

async function getUser(userId: number) {
  return database[userId];
}

export const server = new Server(async (params: OcParameters): Promise<ClientProps> => {
  const user = await getUser(params.userId);
  const [firstName, lastName] = user.name.split(/\s+/);

  return {
    userId: params.userId,
    firstName,
    lastName
  };
}).action('getMoreData', async (params: OcParameters): Promise<AdditionalData> => {
  const user = await getUser(params.userId);

  return {
    age: user.age,
    hobbies: user.hobbies
  };
});

declare module 'oc-server' {
  interface Register {
    server: typeof server;
  }
}

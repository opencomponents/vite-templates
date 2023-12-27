import { Server } from 'oc-server';

const database = [
  { name: 'John Doe', email: 'john@doe.com', age: 32 },
  { name: 'Jane Doe', email: 'jane@doe.com', age: 31 }
];

async function getUser(userId: number) {
  return database[userId];
}

export const server = new Server(async (params: { userId: number; moreData?: boolean }) => {
  const { moreData, userId } = params;
  const { email, name, age } = await getUser(userId);

  return {
    userId,
    name,
    email,
    age: moreData && age
  };
});

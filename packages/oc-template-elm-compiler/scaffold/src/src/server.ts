const database = [
  { name: 'John Doe', email: 'john@doe.com', age: 32 },
  { name: 'Jane Doe', email: 'jane@doe.com', age: 31 }
];

async function getUser(userId: number) {
  return database[userId];
}

export async function data(context: any, callback: (error: any, data: any) => void) {
  const { moreData } = context.params;
  const userId = Number(context.params.userId || 0);
  const { email, name, age } = await getUser(userId);

  return callback(null, {
    userId,
    name,
    email,
    age: moreData && age
  });
}

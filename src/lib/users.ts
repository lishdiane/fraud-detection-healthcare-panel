const users = [{ id: 1, email: "user@email.com", password: "password" }, {
 id: 2, email: "diane@email.com", password: "password1"
}]

export async function findUser(email: string) {

  for (const user of users) {
    if (user.email === email) {
      return user;
    }
  }

  return null;
}

export async function findUserById(id: number) {
  for (const user of users) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
}
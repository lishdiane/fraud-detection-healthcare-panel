import sql from "../database/db";

export async function findUser(email: string) {

  const result = await sql`
  SELECT * FROM users WHERE email = ${email}
`;
  return result[0] ?? null;
}

export async function findUserById(id: number) {
  const result = await sql`
  SELECT * FROM users WHERE user_id = ${id}
`
  return result[0] ?? null;
}

export async function addUser(name: string, email: string, password: string) {
  const result = await sql`
  INSERT INTO users (full_name, email, password_hash)
  VALUES (${name}, ${email}, ${password})
  RETURNING user_id, full_name, email
  `;

  return result[0];
}
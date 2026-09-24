"use server";

import { findUser, addUser} from "../../lib/users/users";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../../lib/users/sessions";
import bcrypt from "bcrypt";


export async function login(state: { error?: string, message?: string }, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return { error: "Email and password are required." };
  }

  const data = await findUser(email);

  if (data) {

    const passwordMatch = await bcrypt.compare(password, data.password_hash);

    if (passwordMatch) {
      await createSession(data.user_id)
      redirect("/dashboard")
    } else {
      return {error: "Password is incorrect"}
    }
  };

  return {message: "Invalid email or password. "}
}

export async function logout() {
  await deleteSession();
  redirect("/login")
}

export async function signup(
  state: {error?: string},
  formData: FormData,
) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
     typeof name != "string" ||
     typeof email !== "string" ||
     typeof password !== "string" ||
     !email ||
     !password
   ) {
     return { error: "Full name, email, and password are required." };
  }
  
  const data = await findUser(email);
  
  if (data) {
    return {error: "An account with this email already exists."}
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await addUser(name, email, hashedPassword);
  redirect("/login");

}

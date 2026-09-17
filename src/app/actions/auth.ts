"use server";

import { findUser } from "../../lib/users";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../../lib/sessions";

export async function login(state: { error?: string; message?: string }, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  console.log("Email: ", email);
  console.log("Password: ", password);

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return { error: "email and password are required" };
  }

  const data = await findUser(email);

  if (data) {
    if (data.password === password) {
      await createSession(data.id)
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

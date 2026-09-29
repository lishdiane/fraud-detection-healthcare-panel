import { getSession } from "./sessions";
import { redirect } from "next/navigation";
import { findUserById } from "./users";

export default async function requireAuth() {
    const session = await getSession();
  
    if (!session) {
      redirect("/login")
    } 
  
    const user = await findUserById(Number(session.value))
  
    if (!user) {
      redirect("/login")
  }

  return user;
}

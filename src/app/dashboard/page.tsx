import { redirect } from "next/navigation";
import { getSession } from "../../lib/users/sessions";
import { findUserById } from "../../lib/users/users";
import { logout } from "../actions/auth";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login")
  } 

  const user = await findUserById(Number(session.value))

  if (!user) {
    redirect("/login")
  }

  return (
    <div>
      <h1>Yay you have access!!! {user.email}</h1>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  );

}
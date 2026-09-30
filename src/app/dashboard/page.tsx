import { logout } from "../actions/auth";
import requireAuth from "../../lib/users/requireAuth";

export default async function DashboardPage() {

  const user = await requireAuth();

  return (
    <div>
      <h1>Yay you have access!!! {user.email}</h1>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  );

}
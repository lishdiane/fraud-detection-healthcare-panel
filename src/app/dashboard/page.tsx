import { logout } from "../actions/auth";
import requireAuth from "../../lib/users/requireAuth";
import Navigation from "../ui/Navigation";  

export default async function DashboardPage() {

  const user = await requireAuth();

  return (
    <div>
      <Navigation />
    </div>
  );

}
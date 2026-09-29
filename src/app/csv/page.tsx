import requireAuth from "../../lib/users/requireAuth";
import CSVPage from "./CSVPage";

export default async function csvPage() {
    await requireAuth();

    return <CSVPage />;

}
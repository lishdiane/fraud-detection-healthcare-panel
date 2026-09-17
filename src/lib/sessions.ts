import { cookies } from "next/headers"


export async function createSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set("session", userId.toString(), {
    expires: new Date(Date.now() + 10 * 60 * 1000)
  });

}

export async function getSession() {
  const cookieStore = await cookies();
  console.log(cookieStore)
  return cookieStore.get("session");
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
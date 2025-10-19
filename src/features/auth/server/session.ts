import { getServerSession } from "next-auth";
import { authOptions } from "./nextauth-options";

export async function getAuthSession() {
    return getServerSession(authOptions);
}

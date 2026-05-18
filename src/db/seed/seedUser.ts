import { createUser } from "../queries/users";
import { requireSeedValue } from "./seedUtils";

export async function seedUser() {
  return requireSeedValue(
    await createUser({
      name: "Diane Dev",
      email: "annieml99@hotmail.com",
      clerkId: "user_3DJTiW2TXDvMMqCIbAw8zbaSTLC",
    }),
    "user",
  );
    
}

import Clipper from "@/components/clipper";
import Onboarding from "@/components/onboarding";
import { getServerSession } from "next-auth";
import AuthConfig from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(AuthConfig);
  if (!session) {
    return <Onboarding/>;
  }
  return <Clipper/>;
}

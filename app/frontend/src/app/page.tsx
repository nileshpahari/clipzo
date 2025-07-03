// "use client";
import Clipper from "@/components/clipper";
import Onboarding from "@/components/onboarding";
// import { getSession } from "next-auth/react";

export default async function Home() {
  // const session = await getSession();
  const session = 1;
  if (!session) {
    return <Onboarding/>;
  }
  return <Clipper/>;
}

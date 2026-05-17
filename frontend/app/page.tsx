import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import LandingPage from "./landing/page";

export default async function RootPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");
  return <LandingPage />;
}
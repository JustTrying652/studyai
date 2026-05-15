import { redirect } from "next/navigation";

// Root redirects to dashboard for now (add auth check here later)
export default function Home() {
  redirect("/dashboard");
}

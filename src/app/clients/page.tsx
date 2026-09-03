import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClients } from "@/lib/actions/clients";
import Navbar from "@/components/Navbar";
import ClientManager from "./ClientManager";

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const clients = await getClients();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userEmail={session.user.email || ""} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ClientManager initialClients={clients} />
      </main>
    </div>
  );
}
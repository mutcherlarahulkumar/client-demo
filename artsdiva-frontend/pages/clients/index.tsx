import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientListContainer } from "@artsdiva/containers/ClientListContainer";

const ClientsPage: NextPage = () => (
  <main className="mx-auto max-w-3xl px-4 py-6">
    <ClientListContainer />
  </main>
);

export default withAuth(ClientsPage);

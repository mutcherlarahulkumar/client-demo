import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientFormContainer } from "@artsdiva/containers/ClientFormContainer";

const NewClientPage: NextPage = () => (
  <main className="mx-auto max-w-md px-4 py-6">
    <ClientFormContainer />
  </main>
);

export default withAuth(NewClientPage);

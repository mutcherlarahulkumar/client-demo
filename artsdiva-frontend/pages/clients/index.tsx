import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientListContainer } from "@artsdiva/containers/ClientListContainer";

const ClientsPage: NextPage = () => <ClientListContainer />;

export default withAuth(ClientsPage);

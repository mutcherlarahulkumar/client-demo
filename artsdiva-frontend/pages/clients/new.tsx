import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientFormContainer } from "@artsdiva/containers/ClientFormContainer";

const NewClientPage: NextPage = () => <ClientFormContainer />;

export default withAuth(NewClientPage);

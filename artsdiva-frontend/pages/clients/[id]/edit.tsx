import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientFormContainer } from "@artsdiva/containers/ClientFormContainer";

const EditClientPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  return <>{id && <ClientFormContainer clientId={id} />}</>;
};

export default withAuth(EditClientPage);

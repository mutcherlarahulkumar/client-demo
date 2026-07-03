import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientDetailContainer } from "@artsdiva/containers/ClientDetailContainer";

const ClientDetailPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <>{id && <ClientDetailContainer clientId={id} />}</>;
};

export default withAuth(ClientDetailPage);

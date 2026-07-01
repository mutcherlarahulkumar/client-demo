import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ClientDetailContainer } from "@artsdiva/containers/ClientDetailContainer";

const ClientDetailPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <main className="mx-auto max-w-2xl px-4 py-6">{id && <ClientDetailContainer clientId={id} />}</main>;
};

export default withAuth(ClientDetailPage);

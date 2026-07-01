import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkDetailContainer } from "@artsdiva/containers/ArtworkDetailContainer";

const ArtworkDetailPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <main className="mx-auto max-w-2xl px-4 py-6">{id && <ArtworkDetailContainer artworkId={id} />}</main>;
};

export default withAuth(ArtworkDetailPage);

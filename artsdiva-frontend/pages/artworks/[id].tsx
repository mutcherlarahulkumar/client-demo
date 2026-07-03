import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkDetailContainer } from "@artsdiva/containers/ArtworkDetailContainer";

const ArtworkDetailPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <>{id && <ArtworkDetailContainer artworkId={id} />}</>;
};

export default withAuth(ArtworkDetailPage);

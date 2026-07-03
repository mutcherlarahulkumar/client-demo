import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistDetailContainer } from "@artsdiva/containers/ArtistDetailContainer";

const ArtistDetailPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <>{id && <ArtistDetailContainer artistId={id} />}</>;
};

export default withAuth(ArtistDetailPage);

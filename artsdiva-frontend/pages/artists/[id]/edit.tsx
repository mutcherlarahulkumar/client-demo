import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistFormContainer } from "@artsdiva/containers/ArtistFormContainer";

const EditArtistPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;
  return <>{id && <ArtistFormContainer artistId={id} />}</>;
};

export default withAuth(EditArtistPage);

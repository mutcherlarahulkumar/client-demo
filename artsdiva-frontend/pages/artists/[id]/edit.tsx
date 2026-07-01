import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistFormContainer } from "@artsdiva/containers/ArtistFormContainer";

const EditArtistPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <main className="mx-auto max-w-md px-4 py-6">{id && <ArtistFormContainer artistId={id} />}</main>;
};

export default withAuth(EditArtistPage);

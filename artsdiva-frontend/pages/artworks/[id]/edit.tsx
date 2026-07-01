import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkFormContainer } from "@artsdiva/containers/ArtworkFormContainer";

const EditArtworkPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <main className="mx-auto max-w-md px-4 py-6">{id && <ArtworkFormContainer artworkId={id} />}</main>;
};

export default withAuth(EditArtworkPage);

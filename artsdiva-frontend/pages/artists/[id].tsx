import type { NextPage } from "next";
import { useRouter } from "next/router";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistDetailContainer } from "@artsdiva/containers/ArtistDetailContainer";

const ArtistDetailPage: NextPage = () => {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  return <main className="mx-auto max-w-2xl px-4 py-6">{id && <ArtistDetailContainer artistId={id} />}</main>;
};

export default withAuth(ArtistDetailPage);

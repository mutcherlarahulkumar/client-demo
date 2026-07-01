import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistListContainer } from "@artsdiva/containers/ArtistListContainer";

const ArtistsPage: NextPage = () => (
  <main className="mx-auto max-w-3xl px-4 py-6">
    <ArtistListContainer />
  </main>
);

export default withAuth(ArtistsPage);

import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkListContainer } from "@artsdiva/containers/ArtworkListContainer";

const ArtworksPage: NextPage = () => (
  <main className="mx-auto max-w-3xl px-4 py-6">
    <ArtworkListContainer />
  </main>
);

export default withAuth(ArtworksPage);

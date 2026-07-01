import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkFormContainer } from "@artsdiva/containers/ArtworkFormContainer";

const NewArtworkPage: NextPage = () => (
  <main className="mx-auto max-w-md px-4 py-6">
    <ArtworkFormContainer />
  </main>
);

export default withAuth(NewArtworkPage);

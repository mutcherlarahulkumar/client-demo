import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistFormContainer } from "@artsdiva/containers/ArtistFormContainer";

const NewArtistPage: NextPage = () => (
  <main className="mx-auto max-w-md px-4 py-6">
    <ArtistFormContainer />
  </main>
);

export default withAuth(NewArtistPage);

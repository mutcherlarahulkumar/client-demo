import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistFormContainer } from "@artsdiva/containers/ArtistFormContainer";

const NewArtistPage: NextPage = () => <ArtistFormContainer />;

export default withAuth(NewArtistPage);

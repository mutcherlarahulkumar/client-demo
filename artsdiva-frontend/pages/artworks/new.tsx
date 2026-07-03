import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkFormContainer } from "@artsdiva/containers/ArtworkFormContainer";

const NewArtworkPage: NextPage = () => <ArtworkFormContainer />;

export default withAuth(NewArtworkPage);

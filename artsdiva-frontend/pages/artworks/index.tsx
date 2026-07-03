import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtworkListContainer } from "@artsdiva/containers/ArtworkListContainer";

const ArtworksPage: NextPage = () => <ArtworkListContainer />;

export default withAuth(ArtworksPage);

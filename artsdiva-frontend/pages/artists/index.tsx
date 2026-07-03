import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ArtistListContainer } from "@artsdiva/containers/ArtistListContainer";

const ArtistsPage: NextPage = () => <ArtistListContainer />;

export default withAuth(ArtistsPage);

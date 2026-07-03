import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { DashboardContainer } from "@artsdiva/containers/DashboardContainer";

const HomePage: NextPage = () => <DashboardContainer />;

export default withAuth(HomePage);

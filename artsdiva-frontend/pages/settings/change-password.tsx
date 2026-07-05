import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { ChangePasswordContainer } from "@artsdiva/containers/ChangePasswordContainer";

const ChangePasswordPage: NextPage = () => <ChangePasswordContainer />;

export default withAuth(ChangePasswordPage);

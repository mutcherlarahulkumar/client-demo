import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { UserFormContainer } from "@artsdiva/containers/UserFormContainer";

const NewUserPage: NextPage = () => <UserFormContainer />;

export default withAuth(NewUserPage, ["ADMIN"]);

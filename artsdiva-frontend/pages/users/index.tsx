import type { NextPage } from "next";
import { withAuth } from "@artsdiva/hocs/withAuth";
import { UserListContainer } from "@artsdiva/containers/UserListContainer";

const UsersPage: NextPage = () => <UserListContainer />;

export default withAuth(UsersPage, ["ADMIN"]);

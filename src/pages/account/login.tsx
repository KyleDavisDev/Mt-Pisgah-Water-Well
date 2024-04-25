import * as React from "react";
import LoginUser from "../../components/LoginUser/LoginUser";
import { Article } from "../../components/Article/Article";
import Page from "@/components/Page/Page";

export interface LoginProps {}

const login = (): React.JSX.Element => {
  return (
    <Page>
      <LoginUser />
    </Page>
  );
};

export default login;

import * as React from "react";
import LoginUser from "../../components/LoginUser/LoginUser";
import {Article} from "../../components/Article/Article";
import Page from "@/components/Page/Page";

export interface LoginProps {
}

const Login = (): React.JSX.Element => {
    return (
        <>
            <Page>
                <Article size="sm">
                    <LoginUser/>
                </Article>
            </Page>
        </>
    );
};

export default Login;

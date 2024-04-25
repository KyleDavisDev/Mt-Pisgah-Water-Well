import React from "react";
import { useRouter } from "next/router";
// import validator from "validator";

import {
  TextInput,
  TextInputProps,
} from "../../components/TextInput/TextInput";
import { Link } from "../../components/Link/Link";
// import { FlashMessageProps, FlashMessage } from "../FlashMessage/FlashMessage";
import {
  StyledFormContainer,
  StyledButton,
  StyledText,
  StyledFooterDivs,
  StyledContainer,
} from "./LoginUserStyle";
import Well from "../Well/Well";
import { Article } from "../Article/Article";

export interface LoginProps {}

const LoginUser: React.FC<LoginProps> = () => {
  const MIN_PASSWORD_LENGTH = 8;
  const _pageTitle = "Login";
  const _submitButtonText = "Login";
  const _registerLink = { href: "/account/register", text: "Sign up!" };
  const _defaultErrorMessage =
    "There was a problem logging into your account. Please refresh your page and try again!";
  const _forgotPasswordLink = {
    href: "/account/reset/password",
    text: "Forgot your password?",
  };

  // assign state
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  // const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
  //     isVisible: false,
  //     text: "",
  //     type: undefined
  // });

  // assign NextJS router
  const router = useRouter();

  return (
    <Article size="xs">
      <StyledContainer>
        <Well>
          <StyledFormContainer>
            {/*{flashMessage.isVisible && (*/}
            {/*    <FlashMessage*/}
            {/*        type={flashMessage.type}*/}
            {/*        isVisible*/}
            {/*        onClose={onFlashClose}*/}
            {/*    >*/}
            {/*        {flashMessage.text}*/}
            {/*    </FlashMessage>*/}
            {/*)}*/}

            <form onSubmit={(e) => onSubmit(e)} style={{ width: "100%" }}>
              <TextInput
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                type={"text"}
                id={"username"}
                showLabel={true}
                label={"Username"}
                name={"username"}
                required={true}
              />
              <TextInput
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={"password"}
                id={"password"}
                showLabel={true}
                label={"Password"}
                name={"password"}
                required={true}
              />
              <StyledFooterDivs>
                <StyledButton type="submit">{_submitButtonText}</StyledButton>
              </StyledFooterDivs>

              <StyledText>
                <Link href={_forgotPasswordLink.href}>
                  {_forgotPasswordLink.text}
                </Link>
              </StyledText>
              <StyledText>
                Don't have an account yet?{" "}
                <Link href={_registerLink.href}>{_registerLink.text}</Link>
              </StyledText>
            </form>
          </StyledFormContainer>
        </Well>
      </StyledContainer>
    </Article>
  );

  function onFlashClose() {
    // clear flash message if was shown
    // setFlashMessage({
    //     isVisible: false,
    //     text: "",
    //     type: undefined
    // });
  }

  async function onSubmit(event: React.FormEvent): Promise<any> {
    event.preventDefault();

    // If not username don't even send network request
    // if (!validator.isEmail(username)) {
    //     // setFlashMessage({
    //     //     isVisible: true,
    //     //     text: "An username must be used.",
    //     //     type: "alert"
    //     // });
    //     return;
    // }

    // If password too short, don't send network request
    // if (password.length < MIN_PASSWORD_LENGTH) {
    // setFlashMessage({
    //     isVisible: true,
    //     text: "Password must be longer than 8 characters",
    //     type: "alert"
    // });
    //   return;
    // }

    try {
      const tmp = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      console.log(tmp);
      // Redirect user to where they were or to sauces page
      if (
        router.query &&
        router.query.return &&
        !Array.isArray(router.query.return)
      ) {
        // router.push(`${router.query.return}`);
      } else {
        router.push("/sauces");
      }
    } catch (err) {
      // Create warning flash
      // setFlashMessage({
      //     isVisible: true,
      //     text: err.response?.data?.msg || _defaultErrorMessage,
      //     type: "warning"
      // });

      // reset form
      setUsername("");
      setPassword("");
    }
  }
};

export default LoginUser;

import React from "react";
import { useRouter } from "next/router";
// import validator from "validator";

import { TextInput } from "../../components/TextInput/TextInput";
import { FlashMessageProps, FlashMessage } from "../FlashMessage/FlashMessage";
import {
  StyledFormContainer,
  StyledFooterDivs,
  StyledContainer,
} from "./LoginUserStyle";
import Well from "../Well/Well";
import { Article } from "../Article/Article";
import { Button } from "../Button/Button";

export interface LoginProps {}

const LoginUser: React.FC<LoginProps> = () => {
  const _submitButtonText = "Login";
  const _registerLink = { href: "/account/register", text: "Sign up!" };
  const _defaultErrorMessage =
    "There was a problem logging into your account. Please refresh your page and try again!";

  // assign state
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined,
  });

  // assign NextJS router
  const router = useRouter();

  const onFlashClose = () => {
    // clear flash message if was shown
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined,
    });
  };

  const onSubmit = async (event: React.FormEvent): Promise<any> => {
    event.preventDefault();

    if (!username || !password) {
      setFlashMessage({
        isVisible: true,
        text: "Missing username or password",
        type: "alert",
      });
      return;
    }

    try {
      const tmp = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      console.log(tmp);
      // TODO: Redirect user admin page
    } catch (err: any) {
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || _defaultErrorMessage,
        type: "warning",
      });
      setUsername("");
      setPassword("");
    }
  };

  return (
    <Article size="xs">
      <StyledContainer>
        <Well>
          <StyledFormContainer>
            {flashMessage.isVisible && (
              <FlashMessage
                type={flashMessage.type}
                isVisible
                onClose={onFlashClose}
              >
                {flashMessage.text}
              </FlashMessage>
            )}

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
                <Button type="submit" fullWidth>
                  {_submitButtonText}
                </Button>
              </StyledFooterDivs>
            </form>
          </StyledFormContainer>
        </Well>
      </StyledContainer>
    </Article>
  );
};

export default LoginUser;

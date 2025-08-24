"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FlashMessage, FlashMessageProps } from "../../components/FlashMessage/FlashMessage";
import Article from "../../components/Article/Article";
import { StyledContainer, StyledFooterDivs, StyledFormContainer } from "./pageStyle";
import Well from "../../components/Well/Well";
import TextInput from "../../components/TextInput/TextInput";
import { Button } from "../../components/Button/Button";

const Page = (): React.JSX.Element => {
  const _defaultErrorMessage = "There was a problem logging into your account. Please refresh your page and try again!";

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });
  const router = useRouter();

  const onFlashClose = () => {
    // clear flash message if was shown
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined
    });
  };

  const onSubmit = async (event: React.FormEvent): Promise<any> => {
    event.preventDefault();

    if (!username || !password) {
      setFlashMessage({
        isVisible: true,
        text: "Missing username or password",
        type: "alert"
      });
      return;
    }

    try {
      const response = await fetch("/api/account/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success"
        });

        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      console.log(err);
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || _defaultErrorMessage,
        type: "warning"
      });
      setUsername("");
      setPassword("");
    }
  };

  return (
    <Article size="xs">
      <StyledContainer>
        <Well>
          <h3>Login</h3>
          <StyledFormContainer>
            {flashMessage.isVisible && (
              <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
                {flashMessage.text}
              </FlashMessage>
            )}

            <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
              <TextInput
                onChange={e => setUsername(e.target.value)}
                value={username}
                type={"text"}
                id={"username"}
                showLabel={true}
                label={"Username"}
                name={"username"}
                required={true}
              />
              <TextInput
                onChange={e => setPassword(e.target.value)}
                value={password}
                type={"password"}
                id={"password"}
                showLabel={true}
                label={"Password"}
                name={"password"}
                required={true}
              />
              <div className={"flex flex-row justify-around align-center mt-4"}>
                <Button type="submit" fullWidth>
                  Login
                </Button>
              </div>
            </form>
          </StyledFormContainer>
        </Well>
      </StyledContainer>
    </Article>
  );
};

export default Page;

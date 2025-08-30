"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FlashMessage, FlashMessageProps } from "../../components/FlashMessage/FlashMessage";
import TextInput from "../../components/TextInput/TextInput";
import { Button } from "../../components/Button/Button";
import { ArticleHolder } from "../../admin/dashboard/components/ArticleHolder/ArticleHolder";

const Page = (): React.JSX.Element => {
  const _defaultErrorMessage = "Invalid username or password";

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
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
      setLoading(true);
      const response = await fetch("/api/account/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setFlashMessage({
          isVisible: true,
          text: _defaultErrorMessage,
          type: "warning"
        });

        return;
      }

      router.push("/admin/dashboard");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArticleHolder>
      <h3>Login</h3>
      <div className={"p-6 flex flex-row flex-wrap"}>
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
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </ArticleHolder>
  );
};

export default Page;

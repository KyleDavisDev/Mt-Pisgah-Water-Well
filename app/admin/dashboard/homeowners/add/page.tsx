"use client";

import { useState } from "react";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import TextInput from "../../../../components/TextInput/TextInput";
import { Button } from "../../../../components/Button/Button";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

const Page = () => {
  const _defaultErrorMessage = "There was a problem saving the homeowner. Please refresh your page and try again!";

  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mailingAddress, setMailingAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [flashMessage, setFlashMessage] = useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });

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

    if (loading) return; // Prevent duplicate submissions

    if (!name || !mailingAddress) {
      setFlashMessage({
        isVisible: true,
        text: "Missing name or password",
        type: "alert"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/homeowners/add", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, mailingAddress })
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success"
        });

        setUsername("");
        setPhone("");
        setEmail("");
        setMailingAddress("");
      }
    } catch (err: any) {
      console.log(err);
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || _defaultErrorMessage,
        type: "warning"
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <ArticleHolder>
      <h3>Add Homeowner</h3>
      <div className={"p-4 flex flex-row flex-wrap"}>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          <TextInput
            onChange={e => setUsername(e.target.value)}
            value={name}
            type={"text"}
            id={"name"}
            showLabel={true}
            label={"Name"}
            name={"name"}
            required={true}
          />
          <TextInput
            onChange={e => setEmail(e.target.value)}
            value={email}
            type={"text"}
            id={"email"}
            showLabel={true}
            label={"Email"}
            name={"email"}
          />
          <TextInput
            onChange={e => setPhone(e.target.value)}
            value={phone}
            type={"text"}
            id={"phone"}
            showLabel={true}
            label={"Phone number"}
            name={"phone"}
          />
          <TextInput
            onChange={e => setMailingAddress(e.target.value)}
            value={mailingAddress}
            type={"text"}
            id={"mailingAddress"}
            showLabel={true}
            label={"Mailing Address"}
            name={"mailingAddress"}
            required={true}
          />

          {/*  > div > label {*/}
          {/*  font-size: 0.85rem;*/}
          {/*  text-transform: inherit;*/}
          {/*}*/}
          <div className={"flex flex-row justify-around align-center mt-4"}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Adding..." : "Add Homeowner"}
            </Button>
          </div>
        </form>
      </div>
    </ArticleHolder>
  );
};

export default Page;

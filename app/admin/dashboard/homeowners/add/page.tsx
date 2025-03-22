"use client";

import React from "react";
import { StyledWellContainer, StyledFooterDivs, StyledFormContainer, StyledContainer } from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { TextInput } from "../../../../components/TextInput/TextInput";
import { Button } from "../../../../components/Button/Button";
import { Article } from "../../../../components/Article/Article";

const Page = () => {
  const _defaultErrorMessage = "There was a problem saving the homeowner. Please refresh your page and try again!";

  const [name, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [mailingAddress, setMailingAddress] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
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
    <StyledContainer>
      <Article size="md">
        <StyledWellContainer>
          <Well>
            <h3>Add Homeowner</h3>
            <StyledFormContainer>
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
                <StyledFooterDivs>
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? "Adding..." : "Add Homeowner"}
                  </Button>
                </StyledFooterDivs>
              </form>
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

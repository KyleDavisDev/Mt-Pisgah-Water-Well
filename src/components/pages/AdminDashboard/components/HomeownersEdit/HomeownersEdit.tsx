import React from "react";
import {
  StyledContainer,
  StyledFormContainer,
  StyledTable,
} from "./HomeownersEditStyle";
import Well from "../../../../Well/Well";
import {
  FlashMessage,
  FlashMessageProps,
} from "../../../../FlashMessage/FlashMessage";
import { Button } from "../../../../Button/Button";
import { Link } from "../../../../Link/Link";
import { TextInput } from "../../../../TextInput/TextInput";
import { StyledFooterDivs } from "../HomeownersAdd/HomeownersAddStyle";

const HomeownersEdit = () => {
  const _defaultErrorMessage =
    "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [name, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [mailingAddress, setMailingAddress] = React.useState("");
  const [id, setId] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined,
  });

  React.useEffect(() => {
    if (!loading && id.length === 0) {
      setLoading(true);
      // Fetch data from the API using a GET request
      fetch("/api/homeowners/get", { method: "GET" })
        .then((response) => {
          // Check if the response is successful
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          // Parse the JSON response
          return response.json();
        })
        .then((data) => {
          // Update state with the fetched data
          setUsername("");
          setEmail("");
          setPhone("");
          setMailingAddress("");
          setId("");
        })
        .catch((error) => {
          // Handle fetch errors
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [loading]);

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

    if (!name || !mailingAddress) {
      setFlashMessage({
        isVisible: true,
        text: "Missing name or password",
        type: "alert",
      });
      return;
    }

    try {
      const response = await fetch("/api/homeowners/add", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, mailingAddress }),
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success",
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
        type: "warning",
      });
    }
  };

  return (
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
              value={name}
              type={"text"}
              id={"name"}
              showLabel={true}
              label={"Name"}
              name={"name"}
              required={true}
            />
            <TextInput
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type={"text"}
              id={"email"}
              showLabel={true}
              label={"Email"}
              name={"email"}
            />
            <TextInput
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              type={"text"}
              id={"phone"}
              showLabel={true}
              label={"Phone number"}
              name={"phone"}
            />
            <TextInput
              onChange={(e) => setMailingAddress(e.target.value)}
              value={mailingAddress}
              type={"text"}
              id={"mailingAddress"}
              showLabel={true}
              label={"Mailing Address"}
              name={"mailingAddress"}
              required={true}
            />
            <StyledFooterDivs>
              <Button type="submit" fullWidth>
                Add Homeowner
              </Button>
            </StyledFooterDivs>
          </form>
        </StyledFormContainer>
      </Well>
    </StyledContainer>
  );
};

export default HomeownersEdit;

import { StyledWellContainer, StyledFooterDivs, StyledFormContainer, StyledContainer } from "./UsageAddStyle";
import Well from "../../../../Well/Well";
import { FlashMessage, FlashMessageProps } from "../../../../FlashMessage/FlashMessage";
import { TextInput } from "../../../../TextInput/TextInput";
import { Button } from "../../../../Button/Button";
import React from "react";
import { Article } from "../../../../Article/Article";

const UsageAdd = () => {
  const _defaultErrorMessage = "There was a problem saving the usage. Please refresh your page and try again!";

  // assign state
  const [gallons, setGallons] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [properties, setProperties] = React.useState<{ address: string; description: string; isActive: boolean }[]>([]);
  const [homeowner, setHomeowner] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });

  React.useEffect(() => {
    // Fetch data from the API using a GET request
    fetch("/api/homeowners/get", { method: "GET" })
      .then(response => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        // Parse the JSON response
        return response.json();
      })
      .then(data => {
        // Update state with the fetched data
        setProperties(data.properties);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  }, []);

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

    if (!address) {
      setFlashMessage({
        isVisible: true,
        text: "Missing address",
        type: "alert"
      });
      return;
    }

    try {
      const response = await fetch("/api/usages/add", {
        method: "POST",
        body: JSON.stringify({
          address,
          description: gallons,
          homeowner
        })
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success"
        });

        setAddress("");
        setGallons("");
      }
    } catch (err: any) {
      console.log(err);
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || _defaultErrorMessage,
        type: "warning"
      });
    }
  };

  return (
    <StyledContainer>
      <Article size="md">
        <StyledWellContainer>
          <Well>
            <StyledFormContainer>
              {flashMessage.isVisible && (
                <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
                  {flashMessage.text}
                </FlashMessage>
              )}

              <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
                <TextInput
                  onChange={e => setAddress(e.target.value)}
                  value={address}
                  type={"text"}
                  id={"address"}
                  showLabel={true}
                  label={"Address"}
                  name={"address"}
                  required={true}
                />
                <TextInput
                  onChange={e => setGallons(e.target.value)}
                  value={gallons}
                  type={"text"}
                  id={"description"}
                  showLabel={true}
                  label={"Description"}
                  name={"description"}
                />

                <StyledFooterDivs>
                  <Button type="submit" fullWidth>
                    Add Usages
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

export default UsageAdd;

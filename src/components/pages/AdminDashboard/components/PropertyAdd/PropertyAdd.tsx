import {
  StyledContainer,
  StyledFooterDivs,
  StyledFormContainer,
} from "./PropertyAddStyle";
import Well from "../../../../Well/Well";
import {
  FlashMessage,
  FlashMessageProps,
} from "../../../../FlashMessage/FlashMessage";
import { TextInput } from "../../../../TextInput/TextInput";
import { Button } from "../../../../Button/Button";
import React from "react";
import Select from "../../../../Select/Select";

const PropertyAdd = () => {
  const _defaultErrorMessage =
    "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [description, setDescription] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [homeowners, setHomeowners] = React.useState<
    { name: string; id: string }[]
  >([]);
  const [homeowner, setHomeowner] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined,
  });

  React.useEffect(() => {
    // Fetch data from the API using a GET request
    fetch("/api/homeowners/get")
      .then((response) => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        // Parse the JSON response
        return response.json();
      })
      .then((data) => {
        const tmp = data.homeowners
          .filter((x: any) => x.isActive === "true")
          .map((x: any) => {
            return {
              name: x.name,
              id: x.id,
            };
          });
        // Update state with the fetched data
        setHomeowners(tmp);
        setHomeowner(tmp[0].id);
      })
      .catch((error) => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  }, []);

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

    if (!address) {
      setFlashMessage({
        isVisible: true,
        text: "Missing address",
        type: "alert",
      });
      return;
    }

    try {
      const response = await fetch("/api/properties/add", {
        method: "POST",
        body: JSON.stringify({
          address,
          description,
          homeowner,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success",
        });

        setAddress("");
        setDescription("");
        setHomeowner(homeowners[0].id);
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
        <h3>Add Property</h3>
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
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              type={"text"}
              id={"address"}
              showLabel={true}
              label={"Address"}
              name={"address"}
              required={true}
            />
            <TextInput
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              type={"text"}
              id={"description"}
              showLabel={true}
              label={"Description"}
              name={"description"}
            />
            {homeowners.length === 0 ? (
              <Select
                id="tmp"
                showLabel={true}
                label={"Property belongs to"}
                name={"tmp"}
                options={[{ name: "Loading ...", value: "0" }]}
                onSelect={() => {}}
                selectedValue={""}
                required={true}
              />
            ) : (
              <Select
                id="homeowner"
                showLabel={true}
                label={"Property belongs to"}
                name={"homeowner"}
                options={homeowners.map((h) => ({
                  name: h.name,
                  value: h.id,
                }))}
                onSelect={(e) => {
                  return setHomeowner(e.target.value);
                }}
                selectedValue={homeowner}
                required={true}
              />
            )}

            <StyledFooterDivs>
              <Button type="submit" fullWidth>
                Add Property
              </Button>
            </StyledFooterDivs>
          </form>
        </StyledFormContainer>
      </Well>
    </StyledContainer>
  );
};

export default PropertyAdd;

import React from "react";
import {
  StyledContainer,
  StyledFormContainer,
  StyledTable,
} from "./PropertyViewStyle";
import Well from "../../../../Well/Well";
import {
  FlashMessage,
  FlashMessageProps,
} from "../../../../FlashMessage/FlashMessage";

const PropertyView = () => {
  const _defaultErrorMessage =
    "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [properties, setProperties] = React.useState<
    { address: string; description: string; isActive: boolean }[]
  >([]);
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined,
  });

  React.useEffect(() => {
    // Fetch data from the API using a GET request
    fetch("/api/properties/get", { method: "GET" })
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
        setProperties(data.properties);
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

  return (
    <StyledContainer>
      <Well>
        <h3>All Properties</h3>
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

          <StyledTable>
            <thead>
              <tr>
                <th>Address</th>
                <th>Description</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                return (
                  <tr>
                    <td>{property.address}</td>
                    <td>{property.description}</td>
                    <td>{property.isActive}</td>
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        </StyledFormContainer>
      </Well>
    </StyledContainer>
  );
};

export default PropertyView;

import React from "react";
import SidebarMenu from "../../SidebarMenu/SidebarMenu";
import {
  StyledContainer,
  StyledDiv,
  StyledFormContainer,
  StyledTable,
} from "./PropertyViewStyle";
import Well from "../../Well/Well";
import {
  FlashMessage,
  FlashMessageProps,
} from "../../FlashMessage/FlashMessage";
import { Article } from "../../Article/Article";

const PropertyView = () => {
  const _defaultErrorMessage =
    "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [properties, setHomeowners] = React.useState<
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
        setHomeowners(data.properties);
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

  // const onSubmit = async (event: React.FormEvent): Promise<any> => {
  //   event.preventDefault();
  //
  //   if (!address) {
  //     setFlashMessage({
  //       isVisible: true,
  //       text: "Missing address",
  //       type: "alert",
  //     });
  //     return;
  //   }
  //
  //   try {
  //     const response = await fetch("/api/properties/add", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         address,
  //         description,
  //         homeowner,
  //       }),
  //     });
  //
  //     if (response.ok) {
  //       const data = await response.json();
  //
  //       setFlashMessage({
  //         isVisible: true,
  //         text: data.message,
  //         type: "success",
  //       });
  //
  //       setAddress("");
  //       setDescription("");
  //       setHomeowner(properties[0].id);
  //     }
  //   } catch (err: any) {
  //     console.log(err);
  //     // Create warning flash
  //     setFlashMessage({
  //       isVisible: true,
  //       text: err.response?.data?.msg || _defaultErrorMessage,
  //       type: "warning",
  //     });
  //   }
  // };

  return (
    <StyledDiv>
      <SidebarMenu />
      <Article size="md">
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
      </Article>
    </StyledDiv>
  );
};

export default PropertyView;

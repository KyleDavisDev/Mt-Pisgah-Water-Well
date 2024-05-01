import React from "react";
import {
  StyledContainer,
  StyledFormContainer,
  StyledTable,
} from "./HomeownersViewStyle";
import Well from "../../../../Well/Well";
import {
  FlashMessage,
  FlashMessageProps,
} from "../../../../FlashMessage/FlashMessage";
import { Button } from "../../../../Button/Button";

const HomeownersView = () => {
  const _defaultErrorMessage =
    "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [homeowners, setHomeowners] = React.useState<
    { name: string; mailingAddress: string; isActive: boolean; id: number }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined,
  });

  React.useEffect(() => {
    if (!loading && homeowners.length === 0) {
      setLoading(true);
      // Fetch data from the API using a GET request
      fetch("/api/homeowners/get", { method: "GET" })
        .then((response) => {
          console.log("hi");
          // Check if the response is successful
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          // Parse the JSON response
          return response.json();
        })
        .then((data) => {
          // Update state with the fetched data
          setHomeowners(data.homeowners);
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {homeowners &&
                homeowners.map((homeowner, ind) => {
                  return (
                    <tr key={`tr__${ind}__${homeowner.isActive}`}>
                      <td>{homeowner.name}</td>
                      <td>{homeowner.mailingAddress}</td>
                      <td>{homeowner.isActive}</td>
                      <td style={{ textAlign: "center" }}>
                        <Button
                          onClick={() => {
                            console.log(homeowner.id);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
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

export default HomeownersView;

import {
  StyledWellContainer,
  StyledFooterDivs,
  StyledFormContainer,
  StyledContainer,
  StyledTable
} from "./UsageAddStyle";
import Well from "../../../../Well/Well";
import { FlashMessage, FlashMessageProps } from "../../../../FlashMessage/FlashMessage";
import { Button } from "../../../../Button/Button";
import React from "react";
import { Article } from "../../../../Article/Article";
import styled from "../../../../../theme/styled-components";
import { TextInput } from "../../../../TextInput/TextInput";

const StyledTd = styled.td`
  padding: 0 !important;
  border-bottom: 0 !important;

  div input {
    width: 50%;
    margin-bottom: 0;
    margin-top: 0;
  }

  > div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 55px;
    padding: 8px;
    border-bottom: 1px solid #dddddd;
  }

  > div:last-child {
    padding: 8px;
    border-bottom: 0;
  }
`;

const StyledFakeTd = styled.div``;
const StyledLastFakeTd = styled.td`
  padding: 0 !important;
  border-bottom: 0 !important;
`;

interface UsageVM {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
    description: string;
    usages: {
      id: string;
      gallons: string;
    }[];
  }[];
}

const UsageAdd = () => {
  const _defaultErrorMessage = "There was a problem saving the usage. Please refresh your page and try again!";

  // assign state
  const [homeowners, setHomeowners] = React.useState<UsageVM[]>([]);
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });

  React.useEffect(() => {
    // Fetch data from the API using a GET request
    fetch("/api/usages/getForAdding", { method: "GET" })
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
        setHomeowners(data.homeowners);
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
    return;
    //   if (!address) {
    //     setFlashMessage({
    //       isVisible: true,
    //       text: "Missing address",
    //       type: "alert"
    //     });
    //     return;
    //   }
    //
    //   try {
    //     const response = await fetch("/api/usages/add", {
    //       method: "POST",
    //       body: JSON.stringify({
    //         address,
    //         description: gallons,
    //         homeowner
    //       })
    //     });
    //
    //     if (response.ok) {
    //       const data = await response.json();
    //
    //       setFlashMessage({
    //         isVisible: true,
    //         text: data.message,
    //         type: "success"
    //       });
    //
    //       setAddress("");
    //       setGallons("");
    //     }
    //   } catch (err: any) {
    //     console.log(err);
    //     // Create warning flash
    //     setFlashMessage({
    //       isVisible: true,
    //       text: err.response?.data?.msg || _defaultErrorMessage,
    //       type: "warning"
    //     });
    //   }
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>Add Usage</h3>
            <StyledFormContainer>
              {flashMessage.isVisible && (
                <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
                  {flashMessage.text}
                </FlashMessage>
              )}

              <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Homeowner</th>
                      <th>Property</th>
                      <th>Previous Usage</th>
                      <th>New Usage</th>
                      <th>Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeowners &&
                      homeowners.map(homeowner => {
                        return (
                          <tr key={`homeowner_${homeowner.id}`}>
                            <td>
                              <h4>{homeowner.name}</h4>
                            </td>
                            <StyledTd>
                              {homeowner.properties.map(property => {
                                return <div key={`property_${property.id}`}>{property.address}</div>;
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map(property => {
                                if (!property.usages) return <div>0</div>;
                                if (!property.usages[0]) return <div>0</div>;

                                return (
                                  <div key={`previous_usage_${property.usages[0].id}`}>
                                    {property.usages[0].gallons}
                                  </div>
                                );
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map(property => {
                                return (
                                  <TextInput key={`new_usage_${property.id}`} id={property.id} onChange={() => {}} />
                                );
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map(p => {
                                return <div>123</div>;
                              })}
                            </StyledTd>
                          </tr>
                        );
                      })}
                  </tbody>
                </StyledTable>
                <StyledFooterDivs>
                  <Button type="submit" fullWidth>
                    Save Usages
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

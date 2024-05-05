import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./PropertyViewStyle";
import Well from "../../../../Well/Well";
import { Button } from "../../../../Button/Button";
import PropertyEditModal from "./components/PropertyEditModal/PropertyEditModal";
import { Article } from "../../../../Article/Article";

export interface propertyVM {
  address: string;
  description: string;
  isActive: string;
  id: string;
}

const PropertyView = () => {
  // assign state
  const [properties, setProperties] = React.useState<propertyVM[]>([]);
  const [activeProperty, setActiveProperty] = React.useState<propertyVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function getProperties() {
    // Fetch data from the API using a GET request
    fetch("/api/properties/get", { method: "GET" })
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
      })
      .finally(() => {
        setLoading(false);
      });
  }

  React.useEffect(() => {
    if (!loading && properties.length === 0) {
      setLoading(true);
      getProperties();
    }
  }, [loading]);

  const onModalClose = () => {
    setShowModal(false);
    setActiveProperty(null);

    getProperties();
  };

  return (
    <StyledContainer>
      <Article size="md">
        <StyledWellContainer>
          <Well>
            <h3>All Properties</h3>
            <StyledFormContainer>
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
                  {properties.map(property => {
                    return (
                      <tr>
                        <td>{property.address}</td>
                        <td>{property.description}</td>
                        <td>{property.isActive}</td>
                        <td style={{ textAlign: "center" }}>
                          <Button
                            onClick={() => {
                              setActiveProperty({ ...property });
                              setShowModal(true);
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
              {activeProperty && (
                <PropertyEditModal showModal={showModal} property={{ ...activeProperty }} onModalClose={onModalClose} />
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default PropertyView;

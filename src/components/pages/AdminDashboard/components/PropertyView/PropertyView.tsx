import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./PropertyViewStyle";
import Well from "../../../../Well/Well";
import { Button } from "../../../../Button/Button";
import PropertyEditModal from "./components/PropertyEditModal/PropertyEditModal";
import { Article } from "../../../../Article/Article";
import { homeownerVM } from "../HomeownersView/HomeownersView";

export interface propertyVM {
  address: string;
  description: string;
  isActive: string;
  id: string;
  homeowner: string;
}

const PropertyView = () => {
  // assign state
  const [properties, setProperties] = React.useState<propertyVM[]>([]);
  const [homeowners, setHomeowners] = React.useState<homeownerVM[]>([]);
  const [activeProperty, setActiveProperty] = React.useState<propertyVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [hadError, setHadError] = React.useState(false);

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

  const getHomeowners = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/homeowners/get`, { method: "GET" })
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
        setHadError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    if (!loading && properties.length === 0 && !hadError) {
      setLoading(true);
      getProperties();
      getHomeowners();
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
                    <th>Homeowner</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(property => {
                    return (
                      <tr key={property.id}>
                        <td>
                          <span
                            style={{
                              height: 10,
                              width: 10,
                              backgroundColor: property.isActive === "true" ? "green" : "red",
                              borderRadius: 50,
                              display: "inline-block",
                              marginRight: 8
                            }}
                          ></span>
                          {property.address}
                        </td>
                        <td>{property.description}</td>
                        <td>{property.homeowner}</td>
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
                <PropertyEditModal
                  showModal={showModal}
                  property={{ ...activeProperty }}
                  onModalClose={onModalClose}
                  homeowners={homeowners}
                />
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default PropertyView;

"use client";

import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { Button } from "../../../../components/Button/Button";
import PropertyEditModal from "./components/PropertyEditModal/PropertyEditModal";
import { Article } from "../../../../components/Article/Article";
import { homeownerVM } from "../../homeowners/all/page";

export interface propertyVM {
  address: string;
  description: string;
  isActive: string;
  id: string;
  homeowner: string;
}

const page = () => {
  // assign state
  const [activeProperties, setActiveProperties] = React.useState<propertyVM[]>([]);
  const [inactiveProperties, setInactiveProperties] = React.useState<propertyVM[]>([]);
  const [homeowners, setHomeowners] = React.useState<homeownerVM[]>([]);

  const [activeProperty, setActiveProperty] = React.useState<propertyVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const initialized = React.useRef(false);

  const getProperties = () => {
    // Fetch data from the API using a GET request
    fetch("/api/properties", { method: "GET" })
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

        const active: propertyVM[] = [];
        const inActive: propertyVM[] = [];

        data.properties.forEach((p: any) => {
          if (p.isActive === "true") {
            active.push(p);
          } else {
            inActive.push(p);
          }
        });

        setActiveProperties(active);
        setInactiveProperties(inActive);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const getHomeowners = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/homeowners`, { method: "GET" })
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
      })
      .finally(() => {});
  };

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getProperties();
      getHomeowners();
    }
  }, []);

  const onModalClose = () => {
    setShowModal(false);
    setActiveProperty(null);
    getProperties();
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>All Properties</h3>
            <StyledFormContainer>
              {activeProperties.length > 0 && (
                <>
                  <h3>Active</h3>
                  <StyledTable style={{ marginBottom: "25px" }}>
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Description</th>
                        <th>Homeowner</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeProperties.map(property => {
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
                </>
              )}

              {inactiveProperties.length > 0 && (
                <>
                  <h3>Inactive</h3>
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
                      {inactiveProperties.map(property => {
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
                </>
              )}

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

export default page;

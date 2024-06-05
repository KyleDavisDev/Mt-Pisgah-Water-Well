import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./UsagesViewStyle";
import Well from "../../../../Well/Well";
import { Article } from "../../../../Article/Article";
import Select from "../../../../Select/Select";
import { Button } from "../../../../Button/Button";
import UsageEditModal from "./components/UsageEditModal/UsageEditModal";

export interface propertyVM {
  address: string;
  description: string;
  isActive: string;
  id: string;
  homeowner: string;
}

export interface usagesVM {
  id: string;
  gallons: string;
  dateCollected: string;
  isActive: string;
}

const UsagesView = () => {
  // assign state
  const [properties, setProperties] = React.useState<propertyVM[]>([]);
  const [property, setProperty] = React.useState("");
  const [usages, setUsages] = React.useState<usagesVM[]>([]);
  const [activeProperty, setActiveProperty] = React.useState<string | null>(null);
  const [activeUsage, setActiveUsage] = React.useState<usagesVM | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const getProperties = () => {
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
  };

  const getUsagesByPropertyId = (id: string) => {
    // Fetch data from the API using a GET request
    fetch(`/api/usages/get?id=${id}`, { method: "GET" })
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

        setUsages(data.usages.map((usage: any) => ({ ...usage, gallons: usage.gallons.toString() })));
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    if (!loading && properties.length === 0) {
      setLoading(true);
      getProperties();
    }
  }, [loading]);

  const onModalClose = () => {
    setShowModal(false);

    if (activeProperty) getUsagesByPropertyId(activeProperty);
  };

  const renderDifference = (usage1: number, usage2: number) => {
    const difference = usage1 - usage2;

    if (difference >= 0) {
      return <span style={{ color: "green" }}>{`+${difference}`}</span>;
    }

    return <span style={{ color: "red" }}>{`${difference}`}</span>;
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>View Usages</h3>
            <StyledFormContainer>
              <Select
                id={"select_homeowner"}
                options={[{ name: "Select...", value: "0" }].concat(
                  properties.map(h => {
                    return {
                      name: h.address,
                      value: h.id
                    };
                  })
                )}
                selectedValue={property}
                onSelect={e => {
                  setProperty(e.target.value);

                  if (e.target.value === "0") return;
                  setActiveProperty(e.target.value);
                  getUsagesByPropertyId(e.target.value);
                }}
              />
              {activeProperty && (
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Date Collected</th>
                      <th>Gallons</th>
                      <th>Difference</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {usages &&
                      usages.map((usage, ind) => {
                        return (
                          <tr>
                            <td>
                              {" "}
                              <span
                                style={{
                                  height: 10,
                                  width: 10,
                                  backgroundColor: usage.isActive === "true" ? "green" : "red",
                                  borderRadius: 50,
                                  display: "inline-block",
                                  marginRight: 8
                                }}
                              ></span>
                              {usage.dateCollected}
                            </td>
                            <td>{usage.gallons}</td>
                            <td>
                              {ind < usages.length - 1
                                ? renderDifference(parseInt(usage.gallons, 10), parseInt(usages[ind + 1].gallons, 10))
                                : ""}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <Button
                                onClick={() => {
                                  setActiveUsage({ ...usage });
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
              )}

              {showModal && activeUsage && (
                <UsageEditModal showModal={showModal} usage={{ ...activeUsage }} onModalClose={onModalClose} />
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default UsagesView;

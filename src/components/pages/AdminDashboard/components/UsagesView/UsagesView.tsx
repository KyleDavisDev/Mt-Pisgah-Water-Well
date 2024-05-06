import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./UsagesViewStyle";
import Well from "../../../../Well/Well";
import { Article } from "../../../../Article/Article";
import Select from "../../../../Select/Select";

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
  const [activeUsage, setActiveUsage] = React.useState<propertyVM | null>(null);
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
        console.log(data);
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
    console.log(id);
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
        console.log(data.usages);
        // Update state with the fetched data
        setUsages(data.usages);
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

    getProperties();
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
                  getUsagesByPropertyId(e.target.value);
                }}
              />
              <StyledTable>
                <thead>
                  <tr>
                    <th>Date Collected</th>
                    <th>Gallons</th>
                    <th>Active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usages &&
                    usages.map(usage => {
                      return (
                        <tr>
                          <td>{usage.dateCollected}</td>
                          <td>{usage.gallons}</td>
                          <td>{usage.isActive}</td>
                          <td style={{ textAlign: "center" }}>
                            {/*<Button*/}
                            {/*  onClick={() => {*/}
                            {/*    setActiveProperty({ ...property });*/}
                            {/*    setShowModal(true);*/}
                            {/*  }}*/}
                            {/*>*/}
                            {/*  Edit*/}
                            {/*</Button>*/}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </StyledTable>
              {/*{activeUsage && (*/}
              {/*  <UsageEditModal showModal={showModal} property={{ ...activeUsage }} onModalClose={onModalClose} />*/}
              {/*)}*/}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default UsagesView;

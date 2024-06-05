import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./HomeownersViewStyle";
import Well from "../../../../Well/Well";
import { Button } from "../../../../Button/Button";

import HomeownerEditModal from "./components/HomeownerEditModal/HomeownerEditModal";
import { Article } from "../../../../Article/Article";

export interface homeownerVM {
  name: string;
  email?: string;
  phone?: string;
  mailingAddress: string;
  isActive: string;
  id: number;
}

const HomeownersView = () => {
  // assign state
  const [homeowner, setHomeowner] = React.useState<homeownerVM[]>([]);
  const [activeHomeowner, setActiveHomeowner] = React.useState<homeownerVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [onMount, setOnMount] = React.useState(true);

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
        setHomeowner(data.homeowners);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onModalClose = () => {
    setShowModal(false);
    setActiveHomeowner(null);

    getHomeowners();
  };

  React.useEffect(() => {
    if (!loading && onMount) {
      setLoading(true);
      getHomeowners();
      setOnMount(false);
    }
  }, [loading]);

  return (
    <StyledContainer>
      <Article size="md">
        <StyledWellContainer>
          <Well>
            <h3>All Homeowners</h3>
            <StyledFormContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {homeowner &&
                    homeowner.map((homeowner, ind) => {
                      return (
                        <tr key={`tr__${ind}__${homeowner.id}`}>
                          <td>
                            <span
                              style={{
                                height: 10,
                                width: 10,
                                backgroundColor: homeowner.isActive === "true" ? "green" : "red",
                                borderRadius: 50,
                                display: "inline-block",
                                marginRight: 8
                              }}
                            ></span>
                            {homeowner.name}
                          </td>
                          <td>{homeowner.mailingAddress}</td>
                          <td>{homeowner.isActive}</td>
                          <td style={{ textAlign: "center" }}>
                            <Button
                              onClick={() => {
                                setActiveHomeowner({ ...homeowner });
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
              {showModal && activeHomeowner && (
                <HomeownerEditModal
                  showModal={showModal}
                  homeowner={{ ...activeHomeowner }}
                  onModalClose={onModalClose}
                />
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default HomeownersView;

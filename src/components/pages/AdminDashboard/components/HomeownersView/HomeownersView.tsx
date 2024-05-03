import React from "react";
import {
  StyledContainer,
  StyledFormContainer,
  StyledTable,
} from "./HomeownersViewStyle";
import Well from "../../../../Well/Well";
import { Button } from "../../../../Button/Button";

import HomeownerEditModal from "./components/HomeownerEditModal/HomeownerEditModal";

export interface homeownerVM {
  name: string;
  email: string;
  phone: string;
  mailingAddress: string;
  isActive: string;
  id: number;
}

const HomeownersView = () => {
  const _defaultErrorMessage =
    "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [homeowner, setHomeowner] = React.useState<homeownerVM[]>([]);
  const [activeHomeowner, setActiveHomeowner] =
    React.useState<homeownerVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const getHomeowners = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/homeowners/get`, { method: "GET" })
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
        setHomeowner(data.homeowners);
      })
      .catch((error) => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    if (!loading && homeowner.length === 0) {
      setLoading(true);
      getHomeowners();
    }
  }, [loading]);

  const onModalClose = () => {
    setShowModal(false);
    setActiveHomeowner(null);

    getHomeowners();
  };

  return (
    <StyledContainer>
      <Well>
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
              {homeowner &&
                homeowner.map((homeowner, ind) => {
                  return (
                    <tr key={`tr__${ind}__${homeowner.id}`}>
                      <td>{homeowner.name}</td>
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
          {activeHomeowner && (
            <HomeownerEditModal
              showModal={showModal}
              homeowner={{ ...activeHomeowner }}
              onModalClose={onModalClose}
            />
          )}
        </StyledFormContainer>
      </Well>
    </StyledContainer>
  );
};

export default HomeownersView;

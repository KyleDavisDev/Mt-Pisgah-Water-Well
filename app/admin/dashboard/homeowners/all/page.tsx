"use client";

import React from "react";
import { StyledWellContainer, StyledFormContainer, StyledTable, StyledContainer } from "./pageStyle";
import HomeownerEditModal from "./components/HomeownerEditModal/HomeownerEditModal";
import Well from "../../../../components/Well/Well";
import { Button } from "../../../../components/Button/Button";
import { Article } from "../../../../components/Article/Article";
import { NotificationDot } from "../../../../components/NotificationDot/NotificationDot";
import { StyledBillTemplate } from "../../invoices/view/[id]/pageStyle";

export interface homeownerVM {
  name: string;
  email?: string;
  phone?: string;
  mailingAddress: string;
  isActive: string;
  id: number;
}

const Page = () => {
  // assign state
  const [activeHomeowners, setActiveHomeowners] = React.useState<homeownerVM[]>([]);
  const [inactiveHomeowners, setInactiveHomeowners] = React.useState<homeownerVM[]>([]);
  const [activeHomeowner, setActiveHomeowner] = React.useState<homeownerVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const initialized = React.useRef(false);

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

        const active: homeownerVM[] = [];
        const inactive: homeownerVM[] = [];

        data.homeowners.forEach((h: any) => {
          if (h.isActive === "true") {
            active.push(h);
          } else {
            inactive.push(h);
          }
        });

        setActiveHomeowners(active);
        setInactiveHomeowners(inactive);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const onModalClose = () => {
    setShowModal(false);
    getHomeowners();
  };

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      getHomeowners();
    }
  }, []);

  if (!initialized.current) {
    return (
      <StyledContainer>
        <Article size="md">
          <StyledWellContainer>
            <Well>
              <h3>All Homeowners</h3>
              <StyledFormContainer>Loading bill details...</StyledFormContainer>
            </Well>
          </StyledWellContainer>
        </Article>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Article size="md">
        <StyledWellContainer>
          <Well>
            <h3>All Homeowners</h3>
            <StyledFormContainer>
              {activeHomeowners.length > 0 ? (
                <>
                  <h3>Active</h3>
                  <StyledTable style={{ marginBottom: "25px" }}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Mailing Address</th>
                        <th>Email</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeHomeowners.map((homeowner, ind) => {
                        return (
                          <tr key={`tr__${ind}__${homeowner.id}`}>
                            <td>
                              <NotificationDot variant={"success"} />
                              {homeowner.name}
                            </td>
                            <td>{homeowner.mailingAddress}</td>
                            <td>{homeowner.email}</td>
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
                </>
              ) : (
                <></>
              )}

              {inactiveHomeowners.length > 0 ? (
                <>
                  <h3>Inactive</h3>
                  <StyledTable>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Mailing Address</th>
                        <th>Email</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {inactiveHomeowners.map((homeowner, ind) => {
                        return (
                          <tr key={`tr__${ind}__${homeowner.id}`}>
                            <td>
                              <NotificationDot variant={"danger"} />
                              {homeowner.name}
                            </td>
                            <td>{homeowner.mailingAddress}</td>
                            <td>{homeowner.email}</td>
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
                </>
              ) : (
                <></>
              )}

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

export default Page;

"use client";

import React from "react";

import {
  StyledWellContainer,
  StyledFormContainer,
  StyledTable,
  StyledContainer,
  StyledTableContainer,
  StyledTableHeader
} from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { Article } from "../../../../components/Article/Article";
import { Button } from "../../../../components/Button/Button";
import UsageEditModal from "./components/UsageEditModal/UsageEditModal";
import { formatNumberWithCommas } from "../../util";

export interface usagesVM {
  id: string;
  gallons: string;
  dateCollected: string;
  isActive: string;
}

interface homeownerData {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
    description: string | null | undefined;
    usages: { id: string; gallons: string; dateCollected: string; isActive: string }[];
  }[];
}

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<homeownerData[]>([]);
  const [activeUsage, setActiveUsage] = React.useState<usagesVM | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const initialized = React.useRef(false);

  const getUsagesByHomeowner = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/usages/groupByHomeowner`, { method: "GET" })
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
        console.log(data);

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
      getUsagesByHomeowner();
    }
  }, []);

  const onModalClose = () => {
    setShowModal(false);

    getUsagesByHomeowner();
  };

  const renderDifference = (usage1: number, usage2: number) => {
    const difference = usage1 - usage2;

    if (difference >= 0) {
      return <span style={{ color: "green" }}>{`+${difference}`}</span>;
    }

    return <span style={{ color: "red" }}>{`${difference}`}</span>;
  };

  const formatDate = (dateStr: string): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [year, month, day] = dateStr.split("-");
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>View Usages</h3>
            <StyledFormContainer>
              {homeowners.length > 0 ? (
                homeowners.map(homeowner => {
                  return (
                    <div key={homeowner.id}>
                      <h3>{homeowner.name}</h3>
                      {homeowner.properties.map(property => {
                        return (
                          <StyledTableContainer key={property.id}>
                            <StyledTableHeader>{property.address}</StyledTableHeader>
                            <StyledTable>
                              <thead>
                                <tr>
                                  <th>Date Collected</th>
                                  <th style={{ textAlign: "right" }}>Gallons</th>
                                  <th>Difference</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {property.usages &&
                                  property.usages.map((usage, ind) => {
                                    return (
                                      <tr>
                                        <td>{formatDate(usage.dateCollected)}</td>
                                        <td style={{ textAlign: "right" }}>{formatNumberWithCommas(usage.gallons)}</td>
                                        <td>
                                          {ind < property.usages.length - 1
                                            ? renderDifference(
                                                parseInt(usage.gallons, 10),
                                                parseInt(property.usages[ind + 1].gallons, 10)
                                              )
                                            : "---"}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                          <Button
                                            onClick={() => {
                                              setShowModal(true);
                                              setActiveUsage(usage);
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
                          </StyledTableContainer>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <></>
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

export default Page;

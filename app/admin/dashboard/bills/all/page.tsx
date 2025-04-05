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

export interface billVM {
  id: string;
  amountInPennies: number;
  dateCreated: string;
  gallonsUsed: string;
  isActive: string;
}

interface homeownerData {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
    description: string | null | undefined;
    bills: { id: string; gallonsUsed: string; amountInPennies: number; dateCreated: string; isActive: string }[];
  }[];
}

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<homeownerData[]>([]);
  const [activeUsage, setActiveUsage] = React.useState<billVM | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const initialized = React.useRef(false);

  const getBillsByHomeowner = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/bills/groupByHomeowner`, { method: "GET" })
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
      getBillsByHomeowner();
    }
  }, []);

  const onModalClose = () => {
    setShowModal(false);

    getBillsByHomeowner();
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
            <h3>View Bills</h3>
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
                                  <th>Date Created</th>
                                  <th>Gallons Used</th>
                                  <th>Amount</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {property.bills &&
                                  property.bills.map((bill, ind) => {
                                    return (
                                      <tr>
                                        <td>{formatDate(bill.dateCreated)}</td>
                                        <td>{bill.gallonsUsed}</td>
                                        <td>{bill.amountInPennies}</td>
                                        <td style={{ textAlign: "center" }}>
                                          <Button
                                            onClick={() => {
                                              setShowModal(true);
                                              setActiveUsage(bill);
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

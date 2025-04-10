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
import { billVM, homeownerData } from "./types";

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<homeownerData[]>([]);
  const [activeUsage, setActiveUsage] = React.useState<billVM | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialized = React.useRef(false);

  const getBillsByHomeowner = () => {
    setIsLoading(true);
    setError(null);
    
    fetch(`/api/bills/groupByHomeowner`, { method: "GET" })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setHomeowners(data.homeowners);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError("Failed to load bills. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    try {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const [year, month, day] = dateStr.split("-");
      if (!year || !month || !day) throw new Error("Invalid date format");
      return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  const formatAmountToDollars = (amountInPennies: number): string => {
    return `$${(amountInPennies / 100).toFixed(2)}`;
  };

  const sortBillsByDate = (bills: billVM[]): billVM[] => {
    return [...bills].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  };

  if (isLoading) {
    return (
      <StyledContainer>
        <Article size="lg">
          <StyledWellContainer>
            <Well>
              <h3>Loading bills...</h3>
            </Well>
          </StyledWellContainer>
        </Article>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Article size="lg">
          <StyledWellContainer>
            <Well>
              <h3>Error</h3>
              <p>{error}</p>
              <Button onClick={getBillsByHomeowner}>Retry</Button>
            </Well>
          </StyledWellContainer>
        </Article>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>View Bills</h3>
            <StyledFormContainer>
              {homeowners.length > 0 ? (
                homeowners.map(homeowner => (
                  <div key={homeowner.id}>
                    <h3>{homeowner.name}</h3>
                    {homeowner.properties.map(property => (
                      <StyledTableContainer key={property.id}>
                        <StyledTableHeader>{property.address}</StyledTableHeader>
                        {property.bills && property.bills.length > 0 ? (
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
                              {sortBillsByDate(property.bills).map((bill) => (
                                <tr key={bill.id}>
                                  <td>{formatDate(bill.dateCreated)}</td>
                                  <td>{bill.gallonsUsed}</td>
                                  <td>{formatAmountToDollars(bill.amountInPennies)}</td>
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
                              ))}
                            </tbody>
                          </StyledTable>
                        ) : (
                          <p style={{ padding: "1rem" }}>No bills found for this property</p>
                        )}
                      </StyledTableContainer>
                    ))}
                  </div>
                ))
              ) : (
                <p>No homeowners found</p>
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

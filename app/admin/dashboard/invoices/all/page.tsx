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
import { invoiceDTO, homeownerData } from "./types";
import { formatISODateToUserFriendlyLocal, formatPenniesToDollars } from "../../util";

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<homeownerData[]>([]);
  const [activeUsage, setActiveUsage] = React.useState<invoiceDTO | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialized = React.useRef(false);

  const getInvoicesByHomeowner = () => {
    setIsLoading(true);
    setError(null);

    fetch(`/api/invoices/groupByHomeowner`, { method: "GET" })
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
        setError("Failed to load invoices. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getInvoicesByHomeowner();
    }
  }, []);

  const onModalClose = () => {
    setShowModal(false);
    getInvoicesByHomeowner();
  };

  const sortInvoicesByDate = (invoices: invoiceDTO[]): invoiceDTO[] => {
    return [...invoices].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  };

  if (isLoading) {
    return (
      <StyledContainer>
        <Article size="lg">
          <StyledWellContainer>
            <Well>
              <h3>Loading invoices...</h3>
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
              <Button onClick={getInvoicesByHomeowner}>Retry</Button>
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
            <h3>Invoices</h3>
            <StyledFormContainer>
              {homeowners.length > 0 ? (
                homeowners.map(homeowner => (
                  <div key={homeowner.id}>
                    <h3>{homeowner.name}</h3>
                    {homeowner.properties.map(property => (
                      <StyledTableContainer key={property.id}>
                        <StyledTableHeader>{property.address}</StyledTableHeader>
                        {property.invoices && property.invoices.length > 0 ? (
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
                              {sortInvoicesByDate(property.invoices).map(invoice => (
                                <tr key={invoice.id}>
                                  <td>{formatISODateToUserFriendlyLocal(invoice.dateCreated)}</td>
                                  <td>{invoice.gallonsUsed}</td>
                                  <td>{formatPenniesToDollars(invoice.amountInPennies)}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <Button
                                      onClick={() => {
                                        setActiveUsage(invoice);
                                        setShowModal(true);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        window.open(`/admin/dashboard/invoices/view/${invoice.id}`, "_blank");
                                      }}
                                    >
                                      Print Invoice
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </StyledTable>
                        ) : (
                          <p style={{ padding: "1rem" }}>No invoices found for this property</p>
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

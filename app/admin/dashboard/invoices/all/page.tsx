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
import InvoiceEditModal from "./components/InvoiceEditModal/InvoiceEditModal";
import { invoiceDTO, homeownerData } from "./types";
import {
  formatISODateToUserFriendlyLocal,
  formatNumberWithCommas,
  formatPenniesToDollars,
  getMonthStrFromMonthIndex
} from "../../util";

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

  const onModalClose = (refreshData: boolean) => {
    setShowModal(false);

    if (refreshData) {
      getInvoicesByHomeowner();
    }
  };

  const sortInvoicesByDate = (invoices: invoiceDTO[]): invoiceDTO[] => {
    return invoices.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Newer year first
      }
      return b.month - a.month; // Same year → newer month first
    });
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
                                <th>Pay Period</th>
                                <th>Active</th>
                                <th>Date Created</th>
                                <th>Gallons Used</th>
                                <th>Amount</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortInvoicesByDate(property.invoices).map(invoice => (
                                <tr key={invoice.id}>
                                  <td>{`${getMonthStrFromMonthIndex(invoice.month)}, ${invoice.year}`}</td>
                                  <td>{invoice.isActive}</td>
                                  <td>{formatISODateToUserFriendlyLocal(invoice.dateCreated)}</td>
                                  <td>{formatNumberWithCommas(invoice.gallonsUsed)}</td>
                                  <td>{formatPenniesToDollars(invoice.amountInPennies)}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <Button
                                      onClick={() => {
                                        setActiveUsage(invoice);
                                        setShowModal(true);
                                      }}
                                      style={{ marginRight: "8px" }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        window.open(`/admin/dashboard/invoices/view/${invoice.id}`, "_blank");
                                      }}
                                    >
                                      View Invoice
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </StyledTable>
                        ) : (
                          // TODO: Allow pagination so not all invoices are shown at once
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
                <InvoiceEditModal showModal={showModal} invoice={{ ...activeUsage }} onModalClose={onModalClose} />
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

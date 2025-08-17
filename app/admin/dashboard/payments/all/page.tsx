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
import PaymentEditModal from "./components/PaymentEditModal/PaymentEditModal";
import { formatISODateToUserFriendlyLocal, formatNumberWithCommas, formatPenniesToDollars } from "../../util";

type paymentMethod = "CASH" | "CHECK";

export interface paymentData {
  id: string;
  amountInPennies: number;
  createdAt: string;
  isActive: string;
  method: paymentMethod;
}

interface homeownerData {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
    description: string | null | undefined;
    payments: paymentData[];
  }[];
}

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<homeownerData[]>([]);
  const [activePayment, setActivePayment] = React.useState<paymentData | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const initialized = React.useRef(false);

  const getPaymentsByHomeowner = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/payments/groupByHomeowner`, { method: "GET" })
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
      getPaymentsByHomeowner();
    }
  }, []);

  const onModalClose = () => {
    setShowModal(false);

    getPaymentsByHomeowner();
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>View Payments</h3>
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
                                  <th style={{ textAlign: "right" }}>Amount</th>
                                  <th>Method</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {property.payments &&
                                  property.payments.map(payment => {
                                    return (
                                      <tr key={`ind_${payment.id}`}>
                                        <td>{formatISODateToUserFriendlyLocal(payment.createdAt)}</td>
                                        <td style={{ textAlign: "right" }}>
                                          {formatPenniesToDollars(payment.amountInPennies)}
                                        </td>
                                        <td>{payment.method}</td>
                                        <td style={{ textAlign: "center" }}>
                                          <Button
                                            onClick={() => {
                                              setShowModal(true);
                                              setActivePayment(payment);
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

              {showModal && activePayment && (
                <PaymentEditModal showModal={showModal} payment={{ ...activePayment }} onModalClose={onModalClose} />
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

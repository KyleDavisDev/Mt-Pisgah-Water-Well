"use client";

import React from "react";
import {
  StyledContainer,
  StyledFooterDivs,
  StyledFormContainer,
  StyledTable,
  StyledTd,
  StyledWellContainer
} from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { Button } from "../../../../components/Button/Button";
import { Article } from "../../../../components/Article/Article";
import { formatPenniesToDollars } from "../../util";
import MoneyInput from "../../../../components/MoneyInput/MoneyInput";
import Select from "../../../../components/Select/Select";

type propertyVM = {
  id: string;
  address: string;
  description: string;
  totalInPennies: number;
};

interface HomeownerVM {
  id: string;
  name: string;
  properties: propertyVM[];
}

interface PaymentVM {
  propertyId: string;
  amountInPennies: number;
  method: string;
}

const Page = () => {
  const _defaultErrorMessage = "There was a problem saving the usage. Please refresh your page and try again!";

  const [homeowners, setHomeowners] = React.useState<HomeownerVM[]>([]);
  const [payments, setPayments] = React.useState<PaymentVM[]>([]);
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const initialized = React.useRef(false);

  const getAccountBalanceByHomeowner = () => {
    // Fetch data from the API using a GET request
    fetch("/api/homeowners/accountbalance/all", { method: "GET" })
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
        const homeowners = data.homeowners as HomeownerVM[];

        const payments: PaymentVM[] = homeowners
          .map(h => {
            return h.properties.map(p => {
              return {
                propertyId: p.id,
                amountInPennies: 0,
                method: "CHECK"
              };
            });
          })
          .flat(1);

        setHomeowners(data.homeowners);
        setPayments(payments);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  };

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      getAccountBalanceByHomeowner();
    }
  }, []);

  const onFlashClose = () => {
    // clear flash message if was shown
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined
    });
  };

  const onSubmit = async (event: React.FormEvent): Promise<any> => {
    event.preventDefault();

    if (loading) return false;

    setLoading(true);

    try {
      const response = await fetch("/api/payments/add", {
        method: "POST",
        body: JSON.stringify({ payments: payments.filter(x => !(x.amountInPennies === 0)) })
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success"
        });

        getAccountBalanceByHomeowner();
      }
    } catch (err: any) {
      console.log(err);
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || _defaultErrorMessage,
        type: "warning"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMoneyInput = (property: propertyVM) => {
    const payment = payments.find(x => x.propertyId === property.id);

    const valueInPennies = payment ? payment.amountInPennies : 0;

    return (
      <MoneyInput
        id={`payment_${property.id}`}
        valueInPennies={valueInPennies}
        onChange={amtInPennies => {
          const updatedPayments = payments.map(x => {
            if (x.propertyId === property.id) {
              x.amountInPennies = amtInPennies ?? 0;
            }

            return x;
          });

          setPayments(updatedPayments);
        }}
      />
    );
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>Add Payment</h3>
            <StyledFormContainer>
              {flashMessage.isVisible && (
                <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
                  {flashMessage.text}
                </FlashMessage>
              )}

              <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Homeowner</th>
                      <th>Property</th>
                      <th>Account Balance</th>
                      <th>Payment Amount</th>
                      <th>Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeowners &&
                      homeowners.map(homeowner => {
                        return (
                          <tr key={`homeowner_${homeowner.id}`}>
                            <td>
                              <h4>{homeowner.name}</h4>
                            </td>
                            <StyledTd>
                              {homeowner.properties.map(property => {
                                return <div key={`property_${property.id}`}>{property.address}</div>;
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map((property, index) => {
                                return (
                                  <div key={`previous_usage_${index}`}>
                                    {formatPenniesToDollars(property.totalInPennies)}
                                  </div>
                                );
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map((property, index) => {
                                return <div key={`payment_amount_${index}`}>{renderMoneyInput(property)}</div>;
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map((property, index) => {
                                return (
                                  <div key={`payment_type_${index}`}>
                                    <Select
                                      id={`payment_type_${index}`}
                                      selectedValue={"check"}
                                      onSelect={() => {}}
                                      options={[{ name: "Check", value: "check" }]}
                                      required={false}
                                    />
                                  </div>
                                );
                              })}
                            </StyledTd>
                          </tr>
                        );
                      })}
                  </tbody>
                </StyledTable>
                <StyledFooterDivs>
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? "Saving..." : "Save All"}
                  </Button>
                </StyledFooterDivs>
              </form>
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

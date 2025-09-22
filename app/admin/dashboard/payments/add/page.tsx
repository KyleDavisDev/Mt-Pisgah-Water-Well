"use client";

import React from "react";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { Button } from "../../../../components/Button/Button";
import { formatPenniesToDollars } from "../../util";
import MoneyInput from "../../../../components/MoneyInput/MoneyInput";
import Select from "../../../../components/Select/Select";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

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
        className={"[&_input]:mb-0 [&_input]:mt-0"}
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
    <ArticleHolder>
      <h3>Add Payment</h3>
      <div className={"flex flex-row flex-wrap p-6 overflow-x-scroll"}>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          <table className={"w-full text-left border-collapse"}>
            <thead className={"border-collapse"}>
              <tr className={"border-b border-r border-tableBorder"}>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Homeowner</th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Property</th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                  Account Balance
                </th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse min-w-[200px]"}>
                  Payment Amount
                </th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse min-w-[200px]"}>
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody>
              {homeowners &&
                homeowners.map(homeowner => {
                  return (
                    <tr className={"border border-tableBorder"} key={`homeowner_${homeowner.id}`}>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        <h4>{homeowner.name}</h4>
                      </td>
                      <td className={"p-0 border-b-0"}>
                        {homeowner.properties.map(property => {
                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b border-r border-tableBorder last-of-type:border-b-0"
                              }
                              key={`property_${property.id}`}
                            >
                              {property.address}
                            </div>
                          );
                        })}
                      </td>
                      <td className={"p-0 border-b-0"}>
                        {homeowner.properties.map((property, index) => {
                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b border-r border-tableBorder last-of-type:border-b-0"
                              }
                              key={`previous_usage_${index}`}
                            >
                              {formatPenniesToDollars(property.totalInPennies)}
                            </div>
                          );
                        })}
                      </td>
                      <td className={"p-0 border-b-0"}>
                        {homeowner.properties.map((property, index) => {
                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b border-r border-tableBorder [&_div]:w-2/3 last-of-type:border-b-0"
                              }
                              key={`payment_amount_${index}`}
                            >
                              {renderMoneyInput(property)}
                            </div>
                          );
                        })}
                      </td>
                      <td className={"p-0 border-b-0"}>
                        {homeowner.properties.map((property, index) => {
                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b border-r border-tableBorder last-of-type:border-b-0 [&_input]:w-full [&_input]:mb-0 [&_input]:mt-0"
                              }
                              key={`payment_type_${index}`}
                            >
                              <Select
                                className={"[&_div]:mt-0 [&_div]:mb-0"}
                                id={`payment_type_${index}`}
                                selectedValue={payments.find(x => x.propertyId === property.id)?.method || "check"}
                                onSelect={e => {
                                  const updatedPayments = payments.map(x => {
                                    if (x.propertyId === property.id) {
                                      x.method = e.target.value as string;
                                    }
                                    return x;
                                  });

                                  setPayments(updatedPayments);
                                }}
                                options={[
                                  { name: "Check", value: "CHECK" },
                                  { name: "Cash", value: "CASH" }
                                ]}
                                required={false}
                              />
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className={"flex flex-row justify-around align-center mt-4"}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Saving..." : "Save All"}
            </Button>
          </div>
        </form>
      </div>
    </ArticleHolder>
  );
};

export default Page;

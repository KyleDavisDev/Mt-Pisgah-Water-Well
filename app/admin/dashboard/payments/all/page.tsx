"use client";

import React from "react";

import { Button } from "../../../../components/Button/Button";
import PaymentEditModal from "./components/PaymentEditModal/PaymentEditModal";
import { formatISODateToUserFriendlyLocal, formatPenniesToDollars } from "../../util";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

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
    <ArticleHolder>
      <h3>View Payments</h3>
      <div className={"flex flex-row flex-wrap p-6"}>
        {homeowners.length > 0 ? (
          homeowners.map(homeowner => {
            return (
              <div className={"w-full pb-[25px]"} key={homeowner.id}>
                <h3>{homeowner.name}</h3>
                {homeowner.properties.map(property => {
                  return (
                    <div className={"pt-[5px] pb-[15px]"} key={property.id}>
                      <h5 className={"pb-[5px]"}>{property.address}</h5>
                      <table className={"w-full text-left border-collapse mb-[25px]"}>
                        <thead className={"border-collapse"}>
                          <tr>
                            <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                              Date Collected
                            </th>
                            <th className={"border border-tableBorder text-right p-[8px] table-cell border-collapse"}>
                              Amount
                            </th>
                            <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                              Method
                            </th>
                            <th
                              className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}
                            ></th>
                          </tr>
                        </thead>
                        <tbody>
                          {property.payments &&
                            property.payments.map(payment => {
                              return (
                                <tr
                                  className={"border-b border-tableBorder even:bg-gray-200"}
                                  key={`ind_${payment.id}`}
                                >
                                  <td
                                    className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}
                                  >
                                    {formatISODateToUserFriendlyLocal(payment.createdAt)}
                                  </td>
                                  <td
                                    className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}
                                    style={{ textAlign: "right" }}
                                  >
                                    {formatPenniesToDollars(payment.amountInPennies)}
                                  </td>
                                  <td
                                    className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}
                                  >
                                    {payment.method}
                                  </td>
                                  <td
                                    className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}
                                    style={{ textAlign: "center" }}
                                  >
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
                      </table>
                    </div>
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
      </div>
    </ArticleHolder>
  );
};

export default Page;

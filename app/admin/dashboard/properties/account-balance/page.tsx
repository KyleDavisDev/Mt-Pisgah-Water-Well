"use client";

import { useState, useRef, useEffect } from "react";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";
import Select from "../../../../components/Select/Select";
import { formatISODateToUserFriendlyLocal, formatPenniesToDollars } from "../../util";

interface propertyVM {
  id: number;
  street: string;
  description: string;
  isActive: string;
  homeowner: string;
}

interface paymentVM {
  id: number;
  amountInPennies: number;
  method: string;
  propertyId: number;
  createdAt: string;
  isActive: boolean;
}

const Page = () => {
  // assign state
  const [properties, setProperties] = useState<propertyVM[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<propertyVM>();
  const [payments, setPayments] = useState<paymentVM[]>([]);

  const defaultPropertySelection = { name: "-- Select Property -- ", value: "-1" };

  const initialized = useRef(false);

  const getProperties = () => {
    // Fetch data from the API using a GET request
    fetch("/api/properties", { method: "GET" })
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
        setProperties(data.properties);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const getPaymentsByPropertyId = (propertyId: string) => {
    // Fetch data from the API using a GET request
    fetch(`/api/properties/${propertyId}/payments`, { method: "GET" })
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
        setPayments(data.payments);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const sortPaymentsByDate = (paymentsToSort: paymentVM[]): paymentVM[] => {
    return [...paymentsToSort].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getProperties();
    }
  }, []);

  useEffect(() => {
    if (selectedProperty && selectedProperty.id && selectedProperty.id > 0) {
      setPayments([]);
      getPaymentsByPropertyId(selectedProperty.id.toString());
    }
  }, [selectedProperty]);

  if (!initialized.current) {
    return (
      <ArticleHolder>
        <h3>Account Balance</h3>
        <div className={"flex flex-row flex-wrap p-6"}>Loading...</div>
      </ArticleHolder>
    );
  }

  return (
    <ArticleHolder>
      <h3>Account Balance</h3>
      <div className={"flex w-full flex-row"}>
        <div style={{ maxWidth: "380px", width: "100%", marginRight: "25px" }}>
          <Select
            options={[
              defaultPropertySelection,
              ...properties.map(prop => {
                return {
                  name: `${prop.street} (${prop.homeowner})`,
                  value: prop.id.toString()
                };
              })
            ]}
            onSelect={e => {
              const value = parseInt(e.target.value, 10);
              setSelectedProperty(properties.find(p => p.id === value));
            }}
            id={"userWhoGathered"}
            label={"Property"}
            showLabel={true}
            selectedValue={selectedProperty ? selectedProperty.id.toString() : defaultPropertySelection.value}
          />
        </div>
      </div>
      <div className={"w-full flex flex-row"}>
        {/* Sort payments by date */}
        {selectedProperty && payments.length > 0 ? (
          <table className={"w-full text-left border-collapse mb-[25px]"}>
            <thead className={"border-collapse"}>
              <tr>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Date</th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Type</th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Amount</th>
                <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                  Method/Description
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Render payments */}
              {sortPaymentsByDate(payments).map(payment => (
                <tr key={`payment-${payment.id}`}>
                  <td className={"border border-tableBorder p-[8px]"}>
                    {formatISODateToUserFriendlyLocal(payment.createdAt)}
                  </td>
                  <td className={"border border-tableBorder p-[8px]"}>Payment</td>
                  <td className={"border border-tableBorder p-[8px]"}>
                    {payment.amountInPennies === undefined ? "--" : formatPenniesToDollars(payment.amountInPennies)}
                  </td>
                  <td className={"border border-tableBorder p-[8px]"}>{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : selectedProperty ? (
          <div className="p-6">Loading...</div>
        ) : null}
      </div>
    </ArticleHolder>
  );
};

export default Page;

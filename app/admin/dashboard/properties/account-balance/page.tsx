"use client";

import { useState, useRef, useEffect } from "react";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";
import Select from "../../../../components/Select/Select";

interface propertyVM {
  id: string;
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

interface invoiceVM {
  id: number;
  propertyId: number;
  amountInPennies: number;
  type: string;
  metadata: [
    discounts?: [{ name: string; description: string }],
    gallons_end?: number,
    billing_year?: number,
    formula_used?: string,
    gallons_used?: number,
    billing_month?: number,
    gallons_start?: number,
    current_balance_in_pennies?: number
  ];
  createdAt: string;
  isActive: boolean;
}

const Page = () => {
  // assign state
  const [properties, setProperties] = useState<propertyVM[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<propertyVM>();
  const [payments, setPayments] = useState<paymentVM[]>([]);
  const [invoices, setInvoices] = useState<invoiceVM[]>([]);

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

  const getInvoicesByPropertyId = (propertyId: string) => {
    // Fetch data from the API using a GET request
    fetch(`/api/properties/${propertyId}/invoices`, { method: "GET" })
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
        setInvoices(data.payments);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getProperties();
    }
  }, []);

  useEffect(() => {
    if (selectedProperty && selectedProperty.id && parseInt(selectedProperty.id, 10) > 0) {
      getPaymentsByPropertyId(selectedProperty.id);
      getInvoicesByPropertyId(selectedProperty.id);
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
                  value: prop.id
                };
              })
            ]}
            onSelect={e => {
              const value = parseInt(e.target.value, 10);

              return setSelectedProperty(properties[value]);
            }}
            id={"userWhoGathered"}
            label={"Property"}
            showLabel={true}
            selectedValue={selectedProperty ? selectedProperty.street : defaultPropertySelection.name}
          />
        </div>
      </div>
    </ArticleHolder>
  );
};

export default Page;

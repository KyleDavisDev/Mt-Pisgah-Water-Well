"use client";

import { useState, useRef, useEffect } from "react";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";
import Select from "../../../../components/Select/Select";
import { formatISODateToUserFriendlyLocal, formatPenniesToDollars } from "../../util";
import { Link } from "../../../../components/Link/Link";

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

interface invoiceVM {
  id: number;
  propertyId: number;
  amountInPennies: number;
  type: string;
  metadata: {
    discounts: [{ name: string; description: string }];
    gallons_end: number;
    billing_year: number;
    formula_used: string;
    gallons_used: number;
    billing_month: number;
    gallons_start: number;
    balance_in_pennies_start: number;
    balance_in_pennies_end: number;
  };
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
        setInvoices(data.invoices);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const mergePaymentsAndInvoices = (): (paymentVM | invoiceVM)[] => {
    return [...payments, ...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getProperties();
    }
  }, []);

  useEffect(() => {
    if (selectedProperty && selectedProperty.id && selectedProperty.id > 0) {
      setInvoices([]);
      setPayments([]);
      getPaymentsByPropertyId(selectedProperty.id.toString());
      getInvoicesByPropertyId(selectedProperty.id.toString());
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
        {/* Merge and sort payments and invoices */}
        {selectedProperty && (payments.length > 0 || invoices.length > 0) ? (
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
              {/* Render merged payments and invoices */}
              {mergePaymentsAndInvoices().map(item => {
                // Render invoice
                if ("type" in item && "metadata" in item) {
                  const invoice = item as invoiceVM;
                  return (
                    <tr key={`invoice-${invoice.id}`}>
                      <td className={"border border-tableBorder p-[8px]"}>
                        {formatISODateToUserFriendlyLocal(invoice.createdAt)}
                      </td>
                      <td className={"border border-tableBorder p-[8px]"}>
                        Invoice &#x2002;
                        <Link
                          href={`/admin/dashboard/invoices/view/${invoice.id}`}
                          target={"_blank"}
                          className={"text-primaryThemeColor"}
                        >
                          <i>(view)</i>
                        </Link>
                      </td>
                      <td className={"border border-tableBorder p-[8px]"}>
                        {invoice.amountInPennies === undefined ? "--" : formatPenniesToDollars(invoice.amountInPennies)}
                      </td>
                      <td className={"border border-tableBorder p-[8px]"}>{invoice.metadata?.formula_used || "-"}</td>
                    </tr>
                  );
                }
                // Render payment
                if ("method" in item) {
                  const payment = item as paymentVM;
                  return (
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
                  );
                }
                return null;
              })}
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

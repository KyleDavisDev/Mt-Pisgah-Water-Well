"use client";

import React from "react";
import { BillTemplate } from "./components/BillTemplate/BillTemplate";
import { generateBillDetails } from "./utils/billGenerator";
import { billVM } from "./types";

export default function BillView({ params }: { params: { id: string } }) {
  const [bill, setBill] = React.useState<billVM | null>(null);
  const [homeownerName, setHomeownerName] = React.useState("");
  const [propertyAddress, setPropertyAddress] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBillData = async () => {
      try {
        const response = await fetch(`/api/bills/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bill");
        }
        const data = await response.json();
        setBill(data.bill);
        setHomeownerName(data.homeownerName);
        setPropertyAddress(data.propertyAddress);
      } catch (err) {
        setError("Failed to load bill details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillData();
  }, [params.id]);

  React.useEffect(() => {
    // Auto-print when the component loads and data is ready
    if (bill && !isLoading && !error) {
      window.print();
    }
  }, [bill, isLoading, error]);

  if (isLoading) {
    return <div>Loading bill details...</div>;
  }

  if (error || !bill) {
    return <div>Error loading bill: {error}</div>;
  }

  const billDetails = generateBillDetails(bill, homeownerName, propertyAddress);

  return <BillTemplate bill={billDetails} />;
}

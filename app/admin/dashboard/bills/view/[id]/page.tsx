"use client";

import React from "react";
import { useParams } from "next/navigation";

import { BillDetails } from "../../../../../api/bills/types/types";
import BillViewContent from "./BillViewContent";

const Page = () => {
  const params = useParams<{ id: string }>();
  const [invoiceDetails, setInvoiceDetails] = React.useState<BillDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // TODO: Redirect user instead? Shouldn't get here without NextJS breaking...
  if (!params) {
    return (
      <div
        className={
          "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
        }
      >
        Error loading bill: {error}
      </div>
    );
  }

  React.useEffect(() => {
    const fetchInvoiceById = async () => {
      try {
        const response = await fetch(`/api/bills/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bill");
        }
        const data = await response.json();
        console.log(data);
        setInvoiceDetails(data);
      } catch (err) {
        setError("Failed to load bill details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceById();
  }, [params.id]);

  if (isLoading) {
    return (
      <div
        className={
          "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
        }
      >
        Loading bill details...
      </div>
    );
  }

  if (!invoiceDetails) {
    return (
      <div
        className={
          "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
        }
      >
        Something went wrong...
      </div>
    );
  }

  return <BillViewContent billDetails={invoiceDetails} />;
};

export default Page;

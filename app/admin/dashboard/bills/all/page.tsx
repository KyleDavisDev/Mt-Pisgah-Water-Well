"use client";

import React from "react";

import { Button } from "../../../../components/Button/Button";
import InvoiceEditModal from "./components/InvoiceEditModal/InvoiceEditModal";
import { invoiceDTO, homeownerData } from "./types";
import {
  formatISODateToUserFriendlyLocal,
  formatNumberWithCommas,
  formatPenniesToDollars,
  getMonthStrFromMonthIndex
} from "../../util";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<homeownerData[]>([]);
  const [activeUsage, setActiveUsage] = React.useState<invoiceDTO | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const initialized = React.useRef(false);

  const getBillsByHomeowner = () => {
    setIsLoading(true);
    setError(null);

    fetch(`/api/bills?groupBy=homeowner`, { method: "GET" })
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
      getBillsByHomeowner();
    }
  }, []);

  const onModalClose = (refreshData: boolean) => {
    setShowModal(false);

    if (refreshData) {
      getBillsByHomeowner();
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
      <ArticleHolder>
        <h3>Loading invoices...</h3>
      </ArticleHolder>
    );
  }

  if (error) {
    return (
      <ArticleHolder>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={getBillsByHomeowner}>Retry</Button>
      </ArticleHolder>
    );
  }

  const downloadInvoice = (id: string) => {
    console.log("am ihere?");
    console.log(id);
    const url = `/api/bills/${id}/download`;
    // Create a hidden <a> to force a download without navigation.
    const a = document.createElement("a");
    a.href = url;
    a.download = ""; // forces download in most browsers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ArticleHolder>
      <h3>Invoices</h3>
      <div className={"flex flex-row flex-wrap p-6 overflow-x-scroll"}>
        {homeowners.length > 0 ? (
          homeowners.map(homeowner => (
            <div className={"w-full pb-[25px]"} key={homeowner.id}>
              <h3>{homeowner.name}</h3>
              {homeowner.properties.map(property => (
                <div className={"pt-[5px] pr-0 pb-[15px] pl-0"} key={property.id}>
                  <div className={"pt-0 pr-0 pb-[5px] pl-0"}>{property.address}</div>
                  {property.invoices && property.invoices.length > 0 ? (
                    <table className={"w-full text-left border-collapse mb-[25px]"}>
                      <thead className={"border-collapse"}>
                        <tr>
                          <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                            Pay Period
                          </th>
                          {/*<th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>*/}
                          {/*  Active*/}
                          {/*</th>*/}
                          <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                            Date Created
                          </th>
                          <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                            Gallons Used
                          </th>
                          <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                            Amount
                          </th>
                          <th
                            className={
                              "border border-tableBorder text-left p-[8px] table-cell border-collapse min-w-[250px]"
                            }
                          ></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortInvoicesByDate(property.invoices).map(invoice => (
                          <tr className={"border-b border-tableBorder even:bg-gray-200"} key={invoice.id}>
                            <td
                              className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}
                            >{`${getMonthStrFromMonthIndex(invoice.month)}, ${invoice.year}`}</td>
                            {/*<td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>*/}
                            {/*  {invoice.isActive}*/}
                            {/*</td>*/}
                            <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                              {formatISODateToUserFriendlyLocal(invoice.dateCreated)}
                            </td>
                            <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                              {formatNumberWithCommas(invoice.gallonsUsed)}
                            </td>
                            <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                              {formatPenniesToDollars(invoice.amountInPennies)}
                            </td>
                            <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                              <Button
                                displayType={"outline"}
                                disabled
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
                                  window.open(`/admin/dashboard/bills/${invoice.id}`, "_blank");
                                }}
                              >
                                View Invoice
                              </Button>
                              {/*<Button onClick={() => downloadInvoice(invoice.id)}>Download</Button>*/}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    // TODO: Allow pagination so not all invoices are shown at once
                    <p style={{ padding: "1rem" }}>No invoices found for this property</p>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No homeowners found</p>
        )}

        {showModal && activeUsage && (
          <InvoiceEditModal showModal={showModal} invoice={{ ...activeUsage }} onModalClose={onModalClose} />
        )}
      </div>
    </ArticleHolder>
  );
};

export default Page;

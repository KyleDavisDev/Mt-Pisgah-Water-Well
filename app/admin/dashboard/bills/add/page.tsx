"use client";

import React from "react";
import { Button } from "../../../../components/Button/Button";
import Select from "../../../../components/Select/Select";
import { Badge } from "../../../../components/Badge/Badge";
import { NotificationDot } from "../../../../components/NotificationDot/NotificationDot";
import { MONTHS, YEARS } from "../../appConstants";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { formatNumberWithCommas } from "../../util";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

interface Property {
  id: string;
  address: string;
  description?: string;
  gallonsUsed: string;
  startingGallons: number;
  endingGallons: number;
  isAlreadyCreated: boolean;
}

interface Homeowner {
  id: string;
  name: string;
  properties: Property[];
}

const Page = () => {
  const [homeowners, setHomeowners] = React.useState<Homeowner[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>("Jan");
  // TODO: Make year dynamic based off of current year.
  const [selectedYear, setSelectedYear] = React.useState<string>("2026");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });

  // Prefixes a "0" to the single-digit month if needed.
  const getPrefixedMonthValue = (numericMonth: number) => {
    return numericMonth + 1 < 10 ? "0" + (numericMonth + 1).toString() : (numericMonth + 1).toString();
  };

  const fetchAmountUsedByMonthAndYear = () => {
    if (loading) return;

    const numericMonth = MONTHS.indexOf(selectedMonth);
    if (numericMonth === -1) return;

    const formattedMonth = getPrefixedMonthValue(numericMonth);

    setLoading(true);
    onFlashClose();

    fetch(`/api/usages/amount_used?month=${formattedMonth}&year=${selectedYear}`, { method: "GET" })
      .then(response => response.json())
      .then(data => {
        setHomeowners(data.homeowners);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createInvoices = async () => {
    if (loading) return;

    let year = parseInt(selectedYear, 10);
    let numericMonth = MONTHS.indexOf(selectedMonth);
    if (numericMonth === -1) return;

    // Add carryover of one month to account for what the BE expects
    numericMonth += 1;
    if (numericMonth > 12) {
      numericMonth = 1;
      year += 1;
    }

    setLoading(true);
    try {
      const body = {
        month: getPrefixedMonthValue(numericMonth),
        year: year.toString(10)
      };

      const response = await fetch("/api/bills/add", {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Failed to create bills");
      }

      setFlashMessage({
        isVisible: true,
        text: "Invoices created successfully!",
        type: "success"
      });
      fetchAmountUsedByMonthAndYear(); // Refresh data after creating bills
    } catch (error) {
      console.error("Error creating usage bills:", error);
      alert("Failed to create usage bills");
    } finally {
      setLoading(false);
    }
  };

  const onFlashClose = () => {
    // clear flash message if was shown
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined
    });
  };

  const renderTotalUsedCell = (property: Property) => {
    if (property.gallonsUsed === "--") {
      return "---";
    }

    const badge = property.isAlreadyCreated ? (
      <Badge variant={"primary"}>Already Created</Badge>
    ) : (
      <NotificationDot variant={"warning"} />
    );

    return (
      <>
        {formatNumberWithCommas(property.gallonsUsed)} {badge}
      </>
    );
  };

  return (
    <ArticleHolder>
      <h3>Create Usage Invoices</h3>
      <div className={"flex flex-col flex-wrap p-6"}>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible={flashMessage.isVisible} onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}
        <div className={"flex flex-row items-baseline-last w-full"}>
          <div className={"w-full max-w-[380px] mr-[25px]"}>
            <Select
              id={"month"}
              options={MONTHS.map(m => {
                return { name: m, value: m };
              })}
              selectedValue={selectedMonth}
              onSelect={e => setSelectedMonth(e.target.value)}
              label={"Month water was used in:"}
              showLabel={true}
            />
          </div>
          <div className={"w-full max-w-[380px] mr-[25px]"}>
            <Select
              id={"month"}
              options={YEARS.map(y => {
                return { name: y, value: y };
              })}
              selectedValue={selectedYear}
              onSelect={e => setSelectedYear(e.target.value)}
              label={"Year"}
              showLabel={true}
            />
          </div>
          <div className={"w-full max-w-[380px]"}>
            <Button onClick={fetchAmountUsedByMonthAndYear} disabled={loading} displayType={"outline"}>
              {loading ? "Loading..." : "Load"}
            </Button>
          </div>
        </div>
        {homeowners.length > 0 ? (
          homeowners.map(homeowner => (
            <div key={homeowner.id} style={{ width: "100%" }}>
              <h3>{homeowner.name}</h3>
              {homeowner.properties.map(property => (
                <div className={"pt-[5px] pr-0 pl-0 pb-[15px]"} key={property.id}>
                  <h5 className={"pb-[5px]"}>{property.address}</h5>
                  <table className={"w-full text-left border-collapse mb-[25px]"}>
                    <thead className={"border-collapse"}>
                      <tr>
                        <th
                          className={
                            "border border-tableBorder text-center p-[8px] table-cell border-collapse w-full max-w-1/3"
                          }
                        >
                          Starting Gallons
                        </th>
                        <th
                          className={
                            "border border-tableBorder text-center p-[8px] table-cell border-collapse w-full max-w-1/3"
                          }
                        >
                          Ending Gallons
                        </th>
                        <th
                          className={"border border-tableBorder text-center p-[8px] table-cell border-collapse w-full"}
                        >
                          Total Used
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={"border-b border-inputBorder"}>
                        <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                          {formatNumberWithCommas(property.startingGallons.toString()) || "---"}
                        </td>
                        <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                          {formatNumberWithCommas(property.endingGallons.toString()) || "---"}
                        </td>
                        <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                          <strong>{renderTotalUsedCell(property)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}

              {homeowner.properties.length > 1 ? (
                <p style={{ marginTop: 0, marginBottom: "30px" }}>
                  <i>Total Gallons Used (all properties):</i>{" "}
                  {homeowner.properties.reduce(
                    (sum, property) =>
                      sum + (isNaN(parseInt(property.gallonsUsed, 10)) ? 0 : parseInt(property.gallonsUsed, 10)),
                    0
                  )}
                </p>
              ) : (
                <></>
              )}
            </div>
          ))
        ) : (
          <p>Select timeframe above.</p>
        )}

        {homeowners.length > 0 && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Button onClick={createInvoices} disabled={loading}>
              {loading ? "Creating..." : "Create Invoices"}
            </Button>
          </div>
        )}
      </div>
    </ArticleHolder>
  );
};

export default Page;

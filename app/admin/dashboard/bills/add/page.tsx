"use client";

import React from "react";
import {
  StyledWellContainer,
  StyledFormContainer,
  StyledTable,
  StyledContainer,
  StyledTableContainer,
  StyledTableHeader
} from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { Article } from "../../../../components/Article/Article";
import { Button } from "../../../../components/Button/Button";
import Select from "../../../../components/Select/Select";
import { Badge } from "../../../../components/Badge/Badge";
import { NotificationDot } from "../../../../components/NotificationDot/NotificationDot";

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
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const YEARS = [
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
    "2026",
    "2027"
  ];

  const [homeowners, setHomeowners] = React.useState<Homeowner[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>("Jan");
  const [selectedYear, setSelectedYear] = React.useState<string>("2025");

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

  const createBills = async () => {
    if (loading) return;

    const numericMonth = MONTHS.indexOf(selectedMonth);
    if (numericMonth === -1) return;

    setLoading(true);
    try {
      const body = {
        month: getPrefixedMonthValue(numericMonth),
        year: selectedYear
      };

      const response = await fetch("/api/bills/add", {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Failed to create bills");
      }

      // setFlashMessage({
      //   isVisible: true,
      //   text: data.message,
      //   type: "success"
      // });
      fetchAmountUsedByMonthAndYear(); // Refresh data after creating bills
    } catch (error) {
      console.error("Error creating usage bills:", error);
      alert("Failed to create usage bills");
    } finally {
      setLoading(false);
    }
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
        {property.gallonsUsed} {badge}
      </>
    );
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>Create Usage Bills</h3>
            <StyledFormContainer>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "last baseline" }}>
                <div style={{ maxWidth: "380px", width: "100%", marginRight: "25px" }}>
                  <Select
                    id={"month"}
                    options={MONTHS.map(m => {
                      return { name: m, value: m };
                    })}
                    selectedValue={selectedMonth}
                    onSelect={e => setSelectedMonth(e.target.value)}
                    label={"Month"}
                    showLabel={true}
                  />
                </div>
                <div style={{ maxWidth: "380px", width: "100%", marginRight: "25px" }}>
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
                <div style={{ maxWidth: "380px", width: "100%" }}>
                  <Button onClick={fetchAmountUsedByMonthAndYear} disabled={loading} displayType={"outline"}>
                    {loading ? "Loading..." : "Load"}
                  </Button>
                </div>
              </div>
              {homeowners.length > 0 ? (
                homeowners.map(homeowner => (
                  <div key={homeowner.id}>
                    <h3>{homeowner.name}</h3>
                    {homeowner.properties.map(property => (
                      <StyledTableContainer key={property.id}>
                        <StyledTableHeader>{property.address}</StyledTableHeader>
                        <StyledTable>
                          <thead>
                            <tr>
                              <th style={{ maxWidth: "35%", width: "100%" }}>Starting Gallons</th>
                              <th style={{ maxWidth: "35%", width: "100%" }}>Ending Gallons</th>
                              <th>Total Used</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{property.startingGallons || "---"}</td>
                              <td>{property.endingGallons || "---"}</td>
                              <td>
                                <strong>{renderTotalUsedCell(property)}</strong>
                              </td>
                            </tr>
                          </tbody>
                        </StyledTable>
                      </StyledTableContainer>
                    ))}

                    {homeowner.properties.length > 1 ? (
                      <p>
                        <i>Total Gallons Used (All Properties):</i>{" "}
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
                  <Button onClick={createBills} disabled={loading}>
                    {loading ? "Creating..." : "Create Bills"}
                  </Button>
                </div>
              )}
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

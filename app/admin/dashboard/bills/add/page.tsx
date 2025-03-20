"use client";

import React, { useEffect, useState, useRef } from "react";
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

interface Property {
  id: string;
  address: string;
  description?: string;
  gallonsUsed: string;
  startingGallons: number;
  endingGallons: number;
}

interface Homeowner {
  id: string;
  name: string;
  properties: Property[];
}

const Page = () => {
  const [homeowners, setHomeowners] = useState<Homeowner[]>([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchUsages();
    }
  }, []);

  const fetchUsages = () => {
    fetch(`/api/usages/amount_used?month=02&year=2025`, { method: "GET" })
      .then(response => response.json())
      .then(data => {
        setHomeowners(data.homeowners);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const createBills = async () => {
    try {
      const response = await fetch("/api/usage_bill/create", {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to create bills");
      }

      alert("Usage bills created successfully!");
      fetchUsages(); // Refresh data after creating bills
    } catch (error) {
      console.error("Error creating usage bills:", error);
      alert("Failed to create usage bills");
    }
  };

  // const calculateTotalGallons = (property: Property) => {
  //   return property.usages.reduce((total, usage) => total + parseInt(usage.gallonsUsed, 10), 0);
  // };

  const formatDate = (dateStr: string): string => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [year, month, day] = dateStr.split("-");
    return `${months[parseInt(month, 10) - 1]} ${day}, ${year}`;
  };

  if (loading) {
    return (
      <StyledContainer>
        <Article size="lg">
          <StyledWellContainer>
            <Well>Loading data...</Well>
          </StyledWellContainer>
        </Article>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>Create Usage Bills</h3>
            <StyledFormContainer>
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
                              <th>Starting Gallons</th>
                              <th>Ending Gallons</th>
                              <th>Total Used</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{property.startingGallons || "---"}</td>
                              <td>{property.endingGallons || "---"}</td>
                              <td>{property.gallonsUsed || "---"}</td>
                            </tr>
                          </tbody>
                        </StyledTable>
                      </StyledTableContainer>
                    ))}

                    <p>
                      <strong>Total Gallons Used (All Properties):</strong>{" "}
                      {/*{homeowner.properties.reduce((sum, property) => sum + calculateGallonsUsed(property), 0)}*/}
                    </p>
                  </div>
                ))
              ) : (
                <p>No data available.</p>
              )}

              {/* Create Bills Button */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Button onClick={createBills}>Create Bills</Button>
              </div>
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

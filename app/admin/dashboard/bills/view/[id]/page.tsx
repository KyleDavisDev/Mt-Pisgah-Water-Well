"use client";

import React from "react";
import { generateBillDetails } from "./utils/billGenerator";
import { billVM } from "./types";
import {
  StyledAccountInfo,
  StyledAddressSection,
  StyledBillTemplate,
  StyledChargeRow,
  StyledChargesSection,
  StyledChargesTable,
  StyledChargeTotalRow,
  StyledCompanyInfo,
  StyledCurrentUsage,
  StyledHeader,
  StyledHomeownerInfo,
  StyledTable,
  StyledTableRow,
  StyledUsageContainer,
  StyledUsageItem,
  StyledUsageLabel,
  StyledUsageTableTitle,
  StyledUsageValue
} from "./pageStyle";

export default function BillView({ params }: { params: { id: string } }) {
  const [bill, setBill] = React.useState<billVM | null>(null);
  const [homeownerName, setHomeownerName] = React.useState("");
  const [propertyAddress, setPropertyAddress] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBillById = async () => {
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

    fetchBillById();
  }, [params.id]);

  React.useEffect(() => {
    if (bill && !isLoading && !error) {
      // window.print();
    }
  }, [bill, isLoading, error]);

  if (isLoading) {
    return <div>Loading bill details...</div>;
  }

  if (error || !bill) {
    return <div>Error loading bill: {error}</div>;
  }

  const billDetails = generateBillDetails(bill, homeownerName, propertyAddress);

  return (
    <StyledBillTemplate>
      <StyledHeader>
        <StyledCompanyInfo>
          <h2>{billDetails.waterCompany.name}</h2>
          <p>{billDetails.waterCompany.address}</p>
          <p>
            {billDetails.waterCompany.city}, {billDetails.waterCompany.state} {billDetails.waterCompany.zip}
          </p>
          <p>Phone: {billDetails.waterCompany.phone}</p>
          {billDetails.waterCompany.fax && <p>Fax: {billDetails.waterCompany.fax}</p>}
          <p>Email: {billDetails.waterCompany.email}</p>
        </StyledCompanyInfo>
        <StyledAccountInfo>
          <p>Account Date: {billDetails.accountDate}</p>
        </StyledAccountInfo>
      </StyledHeader>

      <StyledAddressSection>
        <StyledHomeownerInfo>
          <p>{billDetails.homeowner.name}</p>
          <p>{billDetails.homeowner.address}</p>
          <p>
            {billDetails.homeowner.city}, {billDetails.homeowner.state} {billDetails.homeowner.zip}
          </p>
        </StyledHomeownerInfo>
      </StyledAddressSection>

      <StyledCurrentUsage>
        <StyledUsageContainer>
          <StyledUsageItem>
            <StyledUsageLabel>Gallons Used</StyledUsageLabel>
            <StyledUsageValue>{billDetails.currentUsage.usage.toLocaleString()}</StyledUsageValue>
          </StyledUsageItem>
          <StyledUsageItem>
            <StyledUsageLabel>Amount Due</StyledUsageLabel>
            <StyledUsageValue>{billDetails.charges.totalAmount.toFixed(2)}</StyledUsageValue>
          </StyledUsageItem>
        </StyledUsageContainer>
      </StyledCurrentUsage>

      <StyledChargesSection>
        <StyledChargesTable>
          <StyledChargeRow>
            <span>Base Charge:</span>
            <span>${billDetails.charges.baseCharge.toFixed(2)}</span>
          </StyledChargeRow>
          <StyledChargeRow>
            <span>Excess Charge:</span>
            <span>${billDetails.charges.excessCharge.toFixed(2)}</span>
          </StyledChargeRow>
          <StyledChargeRow>
            <span>Late Fee:</span>
            <span>${billDetails.charges.lateFee.toFixed(2)}</span>
          </StyledChargeRow>
          <StyledChargeRow>
            <span>Other Charges:</span>
            <span>${billDetails.charges.otherCharges.toFixed(2)}</span>
          </StyledChargeRow>
          <StyledChargeRow>
            <span>Amount Outstanding:</span>
            <span>${billDetails.charges.amountOutstanding.toFixed(2)}</span>
          </StyledChargeRow>
          <StyledChargeTotalRow>
            <span>Total amount owing:</span>
            <span>${billDetails.charges.totalAmount.toFixed(2)}</span>
          </StyledChargeTotalRow>
        </StyledChargesTable>

        <div>
          <StyledUsageTableTitle>Monthly usage figures</StyledUsageTableTitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Month</th>
                <th>Start</th>
                <th>End</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(billDetails.monthlyUsageHistory).map(([month, usage], index) => (
                <StyledTableRow key={month} isEven={index % 2 === 0}>
                  <td>{month}</td>
                  <td>{usage.start.toLocaleString()}</td>
                  <td>{usage.end.toLocaleString()}</td>
                  <td>{usage.usage.toLocaleString()}</td>
                </StyledTableRow>
              ))}
            </tbody>
          </StyledTable>
        </div>
      </StyledChargesSection>
    </StyledBillTemplate>
  );
}

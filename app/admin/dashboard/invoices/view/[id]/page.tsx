"use client";

import React from "react";
import { generateBillDetails } from "./utils/billGenerator";
import { BillDetails, billDTO, historicalUsageDTO, homeownerDTO, propertyDTO } from "./types";
import {
  StyledAccountInfo,
  StyledAddressSection,
  StyledBillTemplate,
  StyledChargesSection,
  StyledCurrentChargesTable,
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
  StyledUsageValue,
  StyledCompanyName
} from "./pageStyle";
import { formatPenniesToDollars, getMonthStrFromMonthIndex } from "../../../util";
import Image from "next/image";

export default function BillView({ params }: { params: { id: string } }) {
  const [bill, setBill] = React.useState<billDTO | null>(null);
  const [homeowner, setHomeowner] = React.useState<homeownerDTO | null>(null);
  const [property, setProperty] = React.useState<propertyDTO | null>(null);
  const [historicalUsage, setHistoricalUsage] = React.useState<historicalUsageDTO[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBillById = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bill");
        }
        const data = await response.json();
        setBill(data.bill);
        setHomeowner(data.homeowner);
        setProperty(data.property);
        setHistoricalUsage(data.historicalUsage);
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

  if (error || !bill || !homeowner || !property || !historicalUsage) {
    return <div>Error loading bill: {error}</div>;
  }

  const billDetails: BillDetails = generateBillDetails(bill, homeowner, property, historicalUsage);

  return (
    <StyledBillTemplate>
      <StyledHeader>
        <StyledCompanyInfo>
          <StyledCompanyName>
            <Image src="/water-well.png" height={75} width={75} alt={"Well Icon"} />
            <h2>{billDetails.waterCompany.name}</h2>
          </StyledCompanyName>
          <p>{billDetails.waterCompany.address}</p>
          <p>
            {billDetails.waterCompany.city}, {billDetails.waterCompany.state} {billDetails.waterCompany.zip}
          </p>
          <p>Phone: {billDetails.waterCompany.phone}</p>
          {billDetails.waterCompany.fax && <p>Fax: {billDetails.waterCompany.fax}</p>}
          <p>Email: {billDetails.waterCompany.email}</p>
        </StyledCompanyInfo>
        <StyledAccountInfo>
          <p>Invoice Created On: {billDetails.createdDate}</p>
          <p>Invoice Number: {billDetails.id}</p>
        </StyledAccountInfo>
      </StyledHeader>

      <StyledAddressSection>
        <StyledHomeownerInfo>
          <p>{billDetails.homeowner.name}</p>
          <p>{billDetails.property.street}</p>
          <p>
            {billDetails.property.city}, {billDetails.property.state} {billDetails.property.zip}
          </p>
        </StyledHomeownerInfo>
      </StyledAddressSection>

      <StyledCurrentUsage>
        <StyledUsageContainer>
          <StyledUsageItem>
            <StyledUsageLabel>Month</StyledUsageLabel>
            <StyledUsageValue>{billDetails.billingPeriod}</StyledUsageValue>
          </StyledUsageItem>
          <StyledUsageItem>
            <StyledUsageLabel>Gallons Used</StyledUsageLabel>
            <StyledUsageValue>{billDetails.currentUsage.usage.toLocaleString()}</StyledUsageValue>
          </StyledUsageItem>
          <StyledUsageItem>
            <StyledUsageLabel>Amount Due</StyledUsageLabel>
            <StyledUsageValue>{billDetails.bill.totalAmount}</StyledUsageValue>
          </StyledUsageItem>
        </StyledUsageContainer>
      </StyledCurrentUsage>

      <StyledChargesSection>
        <div>
          <StyledUsageTableTitle>This Month</StyledUsageTableTitle>
          <StyledCurrentChargesTable>
            <div>
              <span>Base Charge ({billDetails.bill.formula.baseGallons}):</span>
              <span>{billDetails.bill.baseCharge}</span>
            </div>
            <div>
              <span>Excess Charge:</span>
              <span>${billDetails.bill.excessUsageCharge.toFixed(2)}</span>
            </div>
            <div>
              <span>Late Fee:</span>
              <span>${billDetails.bill.lateFee.toFixed(2)}</span>
            </div>
            <div>
              <span>Other Charges:</span>
              <span>${billDetails.bill.otherCharges.toFixed(2)}</span>
            </div>
            <div>
              <span>Amount Outstanding:</span>
              <span>${billDetails.bill.amountOutstanding.toFixed(2)}</span>
            </div>
            <div>
              <span>Total amount owing:</span>
              <span>{billDetails.bill.totalAmount}</span>
            </div>
          </StyledCurrentChargesTable>
        </div>

        <div>
          <StyledUsageTableTitle>Previous Monthly Usages</StyledUsageTableTitle>
          <StyledTable>
            <thead>
              <tr>
                <th>Month</th>
                <th>Usage</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {billDetails.monthlyUsageHistory.map((monthlyUsage, index) => (
                <StyledTableRow key={monthlyUsage.month} isEven={index % 2 === 0}>
                  <td>{getMonthStrFromMonthIndex(monthlyUsage.month)}</td>
                  <td>{monthlyUsage.gallonsUsed}</td>
                  <td>{formatPenniesToDollars(monthlyUsage.amountInPennies)}</td>
                </StyledTableRow>
              ))}
            </tbody>
          </StyledTable>
        </div>
      </StyledChargesSection>
    </StyledBillTemplate>
  );
}

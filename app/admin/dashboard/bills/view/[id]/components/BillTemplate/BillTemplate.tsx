import React from 'react';
import { BillDetails } from '../../types';
import {
  StyledBillTemplate,
  StyledHeader,
  StyledAddressSection,
  StyledBillingPeriod,
  StyledChargesSection,
  StyledChargesTable,
  StyledUsageTable,
  StyledCurrentUsage
} from './BillTemplateStyles';

interface BillTemplateProps {
  bill: BillDetails;
}

export const BillTemplate: React.FC<BillTemplateProps> = ({ bill }) => {
  return (
    <StyledBillTemplate>
      <StyledHeader>
        <div className="company-info">
          <h2>{bill.waterCompany.name}</h2>
          <p>{bill.waterCompany.address}</p>
          <p>{bill.waterCompany.city}, {bill.waterCompany.state} {bill.waterCompany.zip}</p>
          <p>Phone: {bill.waterCompany.phone}</p>
          {bill.waterCompany.fax && <p>Fax: {bill.waterCompany.fax}</p>}
          <p>Email: {bill.waterCompany.email}</p>
        </div>
        <div className="account-info">
          <p>Account Date: {bill.accountDate}</p>
        </div>
      </StyledHeader>

      <StyledAddressSection>
        <div className="homeowner-info">
          <p>{bill.homeowner.name}</p>
          <p>{bill.homeowner.address}</p>
          <p>{bill.homeowner.city}, {bill.homeowner.state} {bill.homeowner.zip}</p>
        </div>
      </StyledAddressSection>

      <StyledBillingPeriod>
        Account for {bill.billingPeriod}
      </StyledBillingPeriod>

      <StyledCurrentUsage>
        <div className="usage-row">
          <div className="usage-item">
            <h5>Current Reading</h5>
            <p>{bill.currentUsage.end.toLocaleString()}</p>
          </div>
          <div className="usage-item">
            <h5>Previous Reading</h5>
            <p>{bill.currentUsage.start.toLocaleString()}</p>
          </div>
          <div className="usage-item">
            <h5>Usage (Gallons)</h5>
            <p>{bill.currentUsage.usage.toLocaleString()}</p>
          </div>
        </div>
      </StyledCurrentUsage>

      <StyledChargesSection>
        <StyledChargesTable>
          <div className="charges-row">
            <span>Base Charge:</span>
            <span>${bill.charges.baseCharge.toFixed(2)}</span>
          </div>
          <div className="charges-row">
            <span>Excess Charge:</span>
            <span>${bill.charges.excessCharge.toFixed(2)}</span>
          </div>
          <div className="charges-row">
            <span>Late Fee:</span>
            <span>${bill.charges.lateFee.toFixed(2)}</span>
          </div>
          <div className="charges-row">
            <span>Other Charges:</span>
            <span>${bill.charges.otherCharges.toFixed(2)}</span>
          </div>
          <div className="charges-row">
            <span>Amount Outstanding:</span>
            <span>${bill.charges.amountOutstanding.toFixed(2)}</span>
          </div>
          <div className="charges-row total">
            <span>Total amount owing:</span>
            <span>${bill.charges.totalAmount.toFixed(2)}</span>
          </div>
        </StyledChargesTable>

        <StyledUsageTable>
          <h4>Monthly usage figures</h4>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Start</th>
                <th>End</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bill.monthlyUsageHistory).map(([month, usage]) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{usage.start.toLocaleString()}</td>
                  <td>{usage.end.toLocaleString()}</td>
                  <td>{usage.usage.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </StyledUsageTable>
      </StyledChargesSection>
    </StyledBillTemplate>
  );
};

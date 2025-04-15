import styled from "../../../../../../../theme/styled-components";

export const StyledBillTemplate = styled.div`
  padding: 40px;
  width: 8.5in;
  min-height: 11in;
  margin: 0 auto;
  background: white;
  color: #333;
  font-family: "Arial", sans-serif;
  line-height: 1.4;
  position: relative;
  box-sizing: border-box;

  @media print {
    padding: 40px;
    width: 100%;
    min-height: auto;
    box-shadow: none;
  }
`;

export const StyledHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 40px;

  .company-info {
    h2 {
      font-size: 20px;
      margin: 0 0 15px 0;
      font-weight: 600;
    }

    p {
      margin: 4px 0;
      font-size: 14px;
    }
  }

  .account-info {
    text-align: right;
    font-size: 14px;
  }
`;

export const StyledAddressSection = styled.div`
  margin-bottom: 40px;

  .homeowner-info {
    p {
      margin: 4px 0;
      font-size: 14px;
    }
  }
`;

export const StyledBillingPeriod = styled.h3`
  text-align: center;
  font-size: 18px;
  margin: 30px 0;
  font-weight: 600;
`;

export const StyledChargesSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 30px 0;
`;

export const StyledChargesTable = styled.div`
  .charges-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    padding: 8px 0;
    font-size: 14px;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    span:last-child {
      text-align: right;
    }

    &.total {
      font-weight: 600;
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
      padding: 12px 0;
      margin-top: 12px;
    }
  }
`;

export const StyledUsageTable = styled.div`
  h4 {
    font-size: 16px;
    margin: 0 0 15px 0;
    font-weight: 600;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th,
    td {
      padding: 8px;
      text-align: right;
      border: 1px solid #ddd;

      &:first-child {
        text-align: left;
      }
    }

    th {
      background: #f8f8f8;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #fafafa;
    }
  }
`;

export const StyledCurrentUsage = styled.div`
  background: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 30px;

  .usage-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    text-align: center;

    .usage-item {
      h5 {
        font-size: 14px;
        margin: 0 0 8px 0;
        color: #666;
      }

      p {
        font-size: 18px;
        margin: 0;
        font-weight: 600;
      }
    }
  }
`;

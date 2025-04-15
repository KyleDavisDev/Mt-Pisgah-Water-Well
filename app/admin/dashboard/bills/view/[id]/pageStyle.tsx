import styled from "../../../../../theme/styled-components";

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
`;

export const StyledCompanyInfo = styled.div`
  h2 {
    font-size: 20px;
    margin: 0 0 15px 0;
    font-weight: 600;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
  }
`;

export const StyledAccountInfo = styled.div`
  text-align: right;
  font-size: 14px;
`;

export const StyledAddressSection = styled.div`
  margin-bottom: 40px;
`;

export const StyledHomeownerInfo = styled.div`
  p {
    margin: 4px 0;
    font-size: 14px;
  }
`;

export const StyledBillingPeriod = styled.h3`
  text-align: center;
  font-size: 18px;
  margin: 15px 0;
  font-weight: 600;
`;

export const StyledChargesSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin: 30px 0;
`;

export const StyledChargeRow = styled.div`
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
`;

export const StyledChargeTotalRow = styled.div`
  font-weight: 600;
  border-top: 2px solid #333;
  border-bottom: 2px solid #333;
  padding: 12px 0;
  margin-top: 12px;
`;

export const StyledChargesTable = styled.div``;

export const StyledUsageTableTitle = styled.h4`
  font-size: 16px;
  margin: 0 0 15px 0;
  font-weight: 600;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    padding: 8px;
    text-align: right;
    border: 1px solid #ddd;
    background: #f8f8f8;
    font-weight: 600;

    &:first-child {
      text-align: left;
    }
  }

  td {
    padding: 8px;
    text-align: right;
    border: 1px solid #ddd;

    &:first-child {
      text-align: left;
    }
  }
`;

export const StyledTableRow = styled.tr<{ isEven?: boolean }>`
  ${props =>
    props.isEven &&
    `
    background: #fafafa;
  `}
`;

export const StyledCurrentUsage = styled.div`
  background: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 30px;
`;

export const StyledUsageContainer = styled.div`
  display: flex;
  flex-direction: row;
  text-align: center;
`;

export const StyledUsageItem = styled.div`
  flex: 1;
`;

export const StyledUsageLabel = styled.h5`
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #666;
`;

export const StyledUsageValue = styled.p`
  font-size: 18px;
  margin: 0;
  font-weight: 600;
`;

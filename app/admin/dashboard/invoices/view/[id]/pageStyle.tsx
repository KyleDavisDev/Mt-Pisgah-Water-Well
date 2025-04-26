import styled from "../../../../../theme/styled-components";

export const StyledBillTemplate = styled.div`
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 40px;
  min-width: 900px;
  min-height: 11in;
  margin: 25px auto;
  background: white;
  color: #333;
  font-family: "Arial", sans-serif;
  line-height: 1.4;
  box-sizing: border-box;

  @media print {
    width: 100%;
    min-height: 100vh;
    box-shadow: none;
  }
`;

export const StyledHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 40px;
`;

export const StyledCompanyInfo = styled.div`
  p {
    margin: 4px 0;
    font-size: 14px;
  }
`;

export const StyledCompanyName = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  margin-bottom: 15px;

  img {
    height: 40px;
    width: 40px;
    margin-right: 10px;
  }

  h2 {
    font-size: 20px;
    font-weight: 600;
  }
`;

export const StyledAccountInfo = styled.div`
  text-align: right;
  font-size: 14px;
`;

export const StyledAddressSection = styled.div``;

export const StyledHomeownerInfo = styled.div`
  p {
    margin: 4px 0;
    font-size: 14px;
  }
`;

export const StyledChargesSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: start;
  margin: 30px 0;

  > div {
    width: 100%;

    &:not(:last-child) {
      margin-right: 20px;
    }

    &:last-child {
      margin-left: 20px;
    }
  }
`;

export const StyledCurrentChargesTable = styled.div`
  div {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;

    &:nth-last-child(2) {
      border-bottom: none;
    }

    &:last-child {
      font-weight: 600;
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
      padding: 12px 0;
      margin-top: 4px;
    }
  }
`;

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
  margin: 25px 0;
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

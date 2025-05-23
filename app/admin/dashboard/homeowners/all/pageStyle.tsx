import styled from "../../../../theme/styled-components";

export const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow: scroll;
`;

export const StyledWellContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const StyledFormContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const StyledTable = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse;

  thead {
    border-collapse: collapse;
  }

  th,
  td {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
    display: table-cell;
    border-collapse: collapse;
  }

  tr {
    border-bottom: 1px solid #ddd;
  }
  tr:nth-child(2n) {
    background-color: #e7e9eb;
  }
`;

export const StyledFooterDivs = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-top: 15px;

  > div > label {
    font-size: 0.85rem;
    text-transform: inherit;
  }
`;

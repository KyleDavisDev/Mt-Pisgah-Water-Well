import styled from "../../../../theme/styled-components";

export const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow: scroll;
`;

export const StyledWellContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const StyledFormContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  > div {
    width: 100%;
    padding-bottom: 25px;
  }
`;

export const StyledTableContainer = styled.div`
  padding: 5px 0 15px;
`;

export const StyledTableHeader = styled.h5`
  padding-bottom: 5px;
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

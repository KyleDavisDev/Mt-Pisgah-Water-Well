import styled from "../../../../theme/styled-components";

export const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow: scroll;
`;

export const StyledWellContainer = styled.div`
  display: flex;
  flex-direction: column;
  //justify-content: center;
  margin-top: 8em;
  height: 100vh;
  overflow: scroll;
`;

export const StyledFormContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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

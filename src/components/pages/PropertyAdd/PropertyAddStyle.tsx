import styled from "../../../theme/styled-components";

export const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${(props) => props.theme.siteFontColor};
`;

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
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

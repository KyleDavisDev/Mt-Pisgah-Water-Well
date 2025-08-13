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
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;

  @media (min-width: ${props => props.theme.smToMd}) {
    padding: 1.5rem;
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

export const StyledTileContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
`;

export const StyledTile = styled.div`
  max-width: 100%;
  width: 100%;
  padding: 30px 0;
  margin: 0 0 20px 0;
  border-bottom: 1px solid grey;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.smToMd}) {
    width: calc(50% - 20px); // Subtract total margin (10px left + 10px right)
    margin: 10px;
  }
  @media (min-width: ${props => props.theme.mdToLg}) {
    width: calc(33.333% - 20px); // Subtract total margin (10px left + 10px right)
  }
`;

export const StyledTopContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

export const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

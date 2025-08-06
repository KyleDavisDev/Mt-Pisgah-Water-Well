import styled from "../../../../theme/styled-components";

export const StyledTopBarToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
  max-width: 100%;
  background-color: ${props => props.theme.white};
  box-shadow: rgba(44, 51, 73, 0.1) 0px 0.5rem 1rem 0px;

  @media print {
    display: none !important;
  }

  @media (min-width: ${props => props.theme.smToMd}) {
    display: none;
  }
`;

export const StyledSideBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  background-color: ${props => props.theme.white};
  box-shadow: rgba(44, 51, 73, 0.1) 0px 0.5rem 1rem 0px;

  @media print {
    display: none !important;
  }

  @media (min-width: ${props => props.theme.smToMd}) {
    width: 100%;
    max-width: 300px;
  }
  @media (min-width: ${props => props.theme.mdToLg}) {
    width: 100%;
  }
`;

export const StyledIconContainer = styled.div`
  display: none;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  width: 100%;

  @media (min-width: ${props => props.theme.smToMd}) {
    display: flex;
  }
`;

export const StyledMenuItemContainer = styled.div`
  padding-left: 0;
`;

export const StyledMenuItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid rgb(237, 241, 247);
  user-select: none;

  &:hover {
    cursor: pointer;
    color: ${props => props.theme.primaryThemeColor};
  }
`;

export const StyledSubMenuItemContainer = styled.div`
  list-style-type: none;
  padding-left: 15px;
  border-bottom: 1px solid rgb(237, 241, 247);
  display: flex;
  flex-direction: row;

  a {
    text-decoration: none;
    color: ${props => props.theme.siteFontColor};
    width: 100%;
    padding: 15px;

    &:hover {
      cursor: pointer;
      color: ${props => props.theme.primaryThemeColor};
    }
  }
`;

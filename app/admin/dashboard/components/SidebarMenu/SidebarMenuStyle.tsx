import styled from "styled-components";

export const StyledSideBarContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 300px;
  background-color: ${(props) => props.theme.white};
  box-shadow: rgba(44, 51, 73, 0.1) 0px 0.5rem 1rem 0px;
`;

export const StyledIconContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  width: 100%;
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
    color: ${(props) => props.theme.primaryThemeColor};
  }
`;

export const StyledSubMenuItemContainer = styled.div`
  list-style-type: none;
  padding-left: 15px;
`;

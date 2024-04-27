import { Article } from "../../Article/Article";
import styled from "styled-components";
import { Link } from "../../Link/Link";
import { useState } from "react";

const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${(props) => props.theme.siteFontColor};
`;

const StyledSideBarContainer = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 300px;
  background-color: ${(props) => props.theme.white};
  box-shadow: rgba(44, 51, 73, 0.1) 0px 0.5rem 1rem 0px;
`;

const StyledIconContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  width: 100%;
`;

const StyledMenuItemContainer = styled.div`
  padding-left: 0;
`;

const StyledMenuItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid rgb(237, 241, 247);
  user-select: none;

  &:hover {
    cursor: pointer;
    color: ${(props) => props.theme.primaryThemeColor};
  }
`;

const StyledSubMenuItemContainer = styled.div`
  list-style-type: none;
  padding-left: 15px;
`;

const AdminDashboard = () => {
  const [showHomeowners, setShowHomeowners] = useState<boolean>(false);

  return (
    <StyledDiv>
      <StyledSideBarContainer>
        <StyledIconContainer>
          <Link href={"/admin/dashboard"}>
            <img
              src={"https://mtpisgahwell.com/well_icon.png"}
              style={{ height: "75px", backgroundColor: "black" }}
              alt={"Well Icon"}
            />
          </Link>
        </StyledIconContainer>
        <StyledMenuItemContainer>
          <StyledMenuItem onClick={() => setShowHomeowners(!showHomeowners)}>
            Homeowners
          </StyledMenuItem>
          {showHomeowners && (
            <>
              <StyledSubMenuItemContainer>
                <Link href={"/homeowners/add"} inverseColors={true}>
                  <StyledMenuItem>Add Homeowner</StyledMenuItem>
                </Link>
              </StyledSubMenuItemContainer>
              <StyledSubMenuItemContainer>
                <Link href={"/homeowners/remove"} inverseColors={true}>
                  <StyledMenuItem>Remove Homeowner</StyledMenuItem>
                </Link>
              </StyledSubMenuItemContainer>
            </>
          )}
        </StyledMenuItemContainer>
      </StyledSideBarContainer>

      <Article>
        <p>Hello world!</p>
      </Article>
    </StyledDiv>
  );
};

export default AdminDashboard;

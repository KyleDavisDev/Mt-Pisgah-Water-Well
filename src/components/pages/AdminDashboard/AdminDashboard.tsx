import { Article } from "../../Article/Article";
import styled from "styled-components";
import { Link } from "../../Link/Link";

const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.siteBackgroundColorDark};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${(props) => props.theme.siteFontColor};
`;

const StyledSideBarContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 300px;
`;

const StyledIconContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-items: center;
  width: 100%;
`;

const AdminDashboard = () => {
  return (
    <StyledDiv>
      <StyledSideBarContainer>
        <StyledIconContainer>
          <Link href={"/admin/dashboard"}>
            <img
              src={"https://mtpisgahwell.com/well_icon.png"}
              style={{ height: "75px" }}
            />
          </Link>
        </StyledIconContainer>
        <ul>
          <li>test</li>
        </ul>
      </StyledSideBarContainer>

      <Article>
        <p>Hello world!</p>
      </Article>
    </StyledDiv>
  );
};

export default AdminDashboard;

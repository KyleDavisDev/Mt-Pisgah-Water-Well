import { Article } from "../../Article/Article";
import styled from "styled-components";
import SidebarMenu from "../../SidebarMenu/SidebarMenu";

const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${(props) => props.theme.siteFontColor};
`;

const AdminDashboard = () => {
  return (
    <StyledDiv>
      <SidebarMenu />

      <Article>
        <p>Hello world!</p>
      </Article>
    </StyledDiv>
  );
};

export default AdminDashboard;

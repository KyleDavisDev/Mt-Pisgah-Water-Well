import styled from "../../theme/styled-components";

export const StyledDiv = styled.div`
  max-width: 2000px;
  width: 100%;
  margin: 0 0;
  border: ${props => props.theme.border};
  background-color: ${props => props.theme.white};
  border-radius: ${props => props.theme.borderRadiusSize};
  display: flex;
  flex-direction: column;
  transition: all 0.2 ease;
  padding: 16px;
  justify-content: flex-start;
  box-sizing: border-box;

  a:last-child {
    margin: auto auto 0;
  }
`;
StyledDiv.displayName = "div";

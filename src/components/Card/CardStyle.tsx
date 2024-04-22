import styled from "../../theme/styled-components";

export const StyledDiv = styled.div`
  max-width: 200px;
  margin: 0 0em;
  border: ${props => props.theme.border};
  display: flex;
  flex-direction: column;
  transition: all 0.2 ease;
  padding-bottom: 1em;
  justify-content: flex-start;

  a:last-child {
    margin: auto auto 0;
  }
`;
StyledDiv.displayName = "div";

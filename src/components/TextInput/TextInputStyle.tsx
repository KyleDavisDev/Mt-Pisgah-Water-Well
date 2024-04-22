import styled from "../../theme/styled-components";

export const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  p {
    font-size: 0.85rem;
    margin-top: 1px;
    margin-bottom: 15px;
  }
`;
StyledDiv.displayName = "div";

export const StyledInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: ${props => props.theme.inputBorder};
  margin-top: 5px;
  margin-bottom: 15px;
  font-family: System;
`;
StyledInput.displayName = "input";

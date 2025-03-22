import styled from "../../theme/styled-components";
const ChevronDown = "/static/ChevronDown.png";

export const CheckboxContainer = styled.div`
  width: 100%;
  padding-left: 10px;
  > label {
    display: inline;

    &:hover {
      cursor: pointer;
    }
  }
`;

export const StyledCheckbox = styled.input`
  background-color: white;
  border: ${props => props.theme.inputBorder};
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition:
    background-color 0.3s,
    color 0.3s,
    border 0.3s;
  vertical-align: middle;
  height: 38px;
  padding: 0px 40px 0 15px;
  font-size: 1rem;
`;

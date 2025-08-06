import styled from "../../theme/styled-components";

export const StyledButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-right: 10px;
`;

export const StyledBar = styled.span`
  height: 3px;
  border-radius: 2px;
  position: absolute;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
`;

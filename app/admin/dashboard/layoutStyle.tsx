"use client";

import styled from "../../theme/styled-components";

export const StyledDiv = styled.div`
  background-color: ${props => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  color: ${props => props.theme.siteFontColor};

  @media print {
    background-color: white;
  }

  @media (min-width: ${props => props.theme.smToMd}) {
    flex-direction: row;
  }
`;

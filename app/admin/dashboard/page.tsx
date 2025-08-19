"use client";

import * as React from "react";
import styled from "../../theme/styled-components";
import Article from "../../components/Article/Article";
import Well from "../../components/Well/Well";

const StyledContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow: scroll;
`;

const StyledWellContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
`;

const StyledWellHolder = styled.div`
  padding: 15px;
  width: 50%;
  box-sizing: border-box;
`;

const Page = (): React.JSX.Element => {
  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <StyledWellHolder>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 1</i>
              <img
                src={
                  "https://www.boredpanda.com/blog/wp-content/uploads/2024/02/relatable-funny-charts-2-65c64163b0f88__700.jpg"
                }
              />
            </Well>
          </StyledWellHolder>
          <StyledWellHolder>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 2</i>
            </Well>
          </StyledWellHolder>
          <StyledWellHolder>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 3</i>
            </Well>
          </StyledWellHolder>
          <StyledWellHolder>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 4</i>
            </Well>
          </StyledWellHolder>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

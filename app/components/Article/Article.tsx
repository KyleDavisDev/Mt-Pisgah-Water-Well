import * as React from "react";

import styled from "../../theme/styled-components";

export interface ArticleProps {
  children: any;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const Article: React.FunctionComponent<ArticleProps> = (props) => {
  return (
    <article className={props.className} style={props.style}>
      {props.children}
    </article>
  );
};

const StyledArticle = styled(Article)`
  max-width: ${(props) => {
    if (props.size === "xs") return "450px";
    if (props.size === "sm") return "600px";
    if (props.size === "md") return "900px";
    return "1200px";
  }};
  width: 100%;
  margin: 0 auto;
  font-family: AvenirNextReg;
  padding: 0 15px;
  box-sizing: border-box;

  > div {
    margin-bottom: 3.5rem;
  }

  @media (min-width: ${(props) => props.theme.smToMd}) {
    padding: 0;

    > div {
      margin-bottom: 3.5rem;
    }
  }
`;

export { StyledArticle as Article };

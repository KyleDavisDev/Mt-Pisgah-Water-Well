"use client";

import * as React from "react";

import styled from "../../theme/styled-components";

export interface ArticleProps {
  children: any;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const Article: React.FunctionComponent<ArticleProps> = props => {
  const getMaxWidth = (size: ArticleProps["size"]) => {
    if (!size) return "max-w-[1200px]";

    const sizes = {
      xs: "max-w-[450px]",
      sm: "max-w-[600px]",
      md: "max-w-[900px]",
      lg: "max-w-[1200px]"
    };

    return sizes[size] || sizes.lg;
  };

  return (
    <article
      className={`${getMaxWidth(props.size)} w-full mx-auto font-avenir px-[15px] box-border [&>div]:mb-14 [&>div]:mt-14 sm:px-0 sm:[&>div]:mb-14`}
      style={props.style}
    >
      {props.children}
    </article>
  );
};

export default Article;

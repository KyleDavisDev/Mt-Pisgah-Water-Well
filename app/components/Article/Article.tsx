"use client";

import * as React from "react";

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
      className={`${getMaxWidth(props.size)} w-full mx-auto font-avenir px-[15px] box-border sm:px-0 ${props.className ? props.className : ""}`}
      style={props.style}
    >
      {props.children}
    </article>
  );
};

export default Article;

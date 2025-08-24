import React from "react";
import Well from "../../../../components/Well/Well";
import Article from "../../../../components/Article/Article";

interface ArticleHolderProps {
  children: any;
}

export const ArticleHolder = ({ children }: ArticleHolderProps) => {
  return (
    <div className={"w-full h-screen overflow-scroll"}>
      <Article size="lg" className={"flex flex-col overflow-scroll rounded-md border border-inputBorder  mt-15 mb-15"}>
        <Well>{children}</Well>
      </Article>
    </div>
  );
};

import React from "react";
import Well from "../../../../components/Well/Well";
import Article from "../../../../components/Article/Article";

interface ArticleHolderProps {
  children: any;
}

export const ArticleHolder = ({ children }: ArticleHolderProps) => {
  return (
    <div className={"w-full h-screen overflow-scroll mt-15"}>
      <Article size="lg" className={"flex flex-col overflow-scroll rounded-md border border-inputBorder"}>
        <Well>{children}</Well>
      </Article>
    </div>
  );
};

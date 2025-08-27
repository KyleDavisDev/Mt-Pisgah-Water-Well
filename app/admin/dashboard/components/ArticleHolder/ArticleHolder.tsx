import React from "react";
import Well from "../../../../components/Well/Well";
import Article from "../../../../components/Article/Article";

interface ArticleHolderProps {
  children: any;
}

export const ArticleHolder = ({ children }: ArticleHolderProps) => {
  return (
    <div className={"w-full h-screen overflow-scroll pl-[15px] pr-[15px]"}>
      <Article
        size="lg"
        className={`flex flex-col overflow-scroll rounded-md border border-inputBorder
         mt-[30px] mb-[30px] pl-0 pr-0
         sm:mt-[60px] sm:mb-[60px]
         `}
      >
        <Well>{children}</Well>
      </Article>
    </div>
  );
};

"use client";

import * as React from "react";
import Article from "../../components/Article/Article";
import Well from "../../components/Well/Well";

const Page = (): React.JSX.Element => {
  return (
    <div className={"w-full h-screen overflow-scroll"}>
      <Article size="lg">
        <div className={"mt-6 flex flex-row justify-center flex-wrap"}>
          <div className={"p-[15px] w-1/2 box-border"}>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 1</i>
              <img
                alt={"Well Icon logo"}
                src={
                  "https://www.boredpanda.com/blog/wp-content/uploads/2024/02/relatable-funny-charts-2-65c64163b0f88__700.jpg"
                }
              />
            </Well>
          </div>
          <div className={"p-[15px] w-1/2 box-border"}>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 2</i>
            </Well>
          </div>
          <div className={"p-[15px] w-1/2 box-border"}>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 3</i>
            </Well>
          </div>
          <div className={"p-[15px] w-1/2 box-border"}>
            <Well style={{ minHeight: 300 }}>
              <i>Random chart 4</i>
            </Well>
          </div>
        </div>
      </Article>
    </div>
  );
};

export default Page;

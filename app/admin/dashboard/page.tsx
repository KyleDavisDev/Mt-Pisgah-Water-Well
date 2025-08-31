"use client";

import * as React from "react";
import Well from "../../components/Well/Well";
import { ArticleHolder } from "./components/ArticleHolder/ArticleHolder";

const Page = () => {
  return (
    <ArticleHolder>
      <h5>Dashboard</h5>
      <p>Charts, extra info coming soon!</p>
      <div className={"flex flex-row flex-wrap"}>
        <div className={"p-[15px] w-full box-border md:w-1/2"}>
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
        <div className={"p-[15px] w-full box-border md:w-1/2"}>
          <Well style={{ minHeight: 300 }}>
            <i>Random chart 2</i>
          </Well>
        </div>
        <div className={"p-[15px] w-full box-border md:w-1/2"}>
          <Well style={{ minHeight: 300 }}>
            <i>Random chart 3</i>
          </Well>
        </div>
        <div className={"p-[15px] w-full box-border md:w-1/2"}>
          <Well style={{ minHeight: 300 }}>
            <i>Random chart 4</i>
          </Well>
        </div>
      </div>
    </ArticleHolder>
  );
};

export default Page;

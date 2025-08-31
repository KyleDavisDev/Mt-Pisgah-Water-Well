"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // .replace() so that the back button won’t land here again
    router.replace("/account/login");
  }, [router]);

  return (
    <div className={"w-full h-screen overflow-scroll pl-[15px] pr-[15px]"}>
      <article
        className={`flex flex-col overflow-scroll rounded-md border border-inputBorder
         mt-[30px] mb-[30px] pl-0 pr-0 max-w-[1200px]
         sm:mt-[60px] sm:mb-[60px]
         `}
      >
        <div
          className="
        max-w-[2000px] w-full mx-0
       bg-white
        flex flex-col justify-start
        p-4
      "
        >
          <h5 className={"text-center pb-3"}>Resource not found!</h5>
          <p className={"text-center"}>Redirecting to login...</p>
        </div>
      </article>
    </div>
  );
}

"use client";

import { ArticleHolder } from "./admin/dashboard/components/ArticleHolder/ArticleHolder";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // .replace() so that the back button won’t land here again
    router.replace("/account/login");
  }, [router]);

  return (
    <ArticleHolder>
      <h5 className={"text-center pb-3"}>Resource not found!</h5>
      <p className={"text-center"}>Redirecting to login...</p>
    </ArticleHolder>
  );
}

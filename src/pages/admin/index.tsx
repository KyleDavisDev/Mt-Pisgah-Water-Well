import Page from "../../components/Page/Page";
import { router } from "next/client";

const index = () => {
  router.push("/admin/dashboard");
  return (
    <Page>
      <p>Redirecting...</p>
    </Page>
  );
};

export default index;

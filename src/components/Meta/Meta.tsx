import Head from "next/head";

interface IMetaProps {}

const Meta = () => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="/static/favicon.png" />
      <title>Mt Pisgah Well</title>
    </Head>
  );
};

export default Meta;

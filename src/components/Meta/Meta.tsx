import Head from "next/head";
interface IMetaProps {}

const Meta = () => {
    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="utf-8" />
            <link rel="shortcut icon" href="/static/favicon.png" />
            <title>Sauce For Your Thoughts!</title>
        </Head>
    );
};

export default Meta;
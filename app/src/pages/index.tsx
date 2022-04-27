import type { NextPage } from "next";
import Head from "next/head";
import { SolanaPostItView } from "../components/PostIts";

const Home: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Solana PostIt!</title>
        <meta name="description" content="Postit!" />
      </Head>
      <SolanaPostItView />
    </>
  );
};

export default Home;

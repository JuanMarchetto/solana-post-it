import type { NextPage } from "next";
import Head from "next/head";
import { SolanaPostItView } from "../components/PostIts";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana PostIt!</title>
        <meta name="description" content="Postit!" />
      </Head>
      <SolanaPostItView />
    </div>
  );
};

export default Home;

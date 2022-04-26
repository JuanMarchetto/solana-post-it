import { FC, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import { SelectAndConnectWalletButton } from "components";
import * as anchor from "@project-serum/anchor";

import { SolanaLogo } from "components";
import { getPostIts, sendPostIt } from "../../utils/postits";
import { useProgram } from "./useProgram";

const endpoint = "http://localhost:8899";
const connection = new anchor.web3.Connection(endpoint);

export const SolanaPostItView: FC = ({ }) => {
  const [isAirDropped, setIsAirDropped] = useState(false);
  const wallet = useAnchorWallet();

  const airdropToWallet = async () => {
    if (wallet) {
      setIsAirDropped(false);
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        1000000000
      );

      const tx = await connection.confirmTransaction(signature);
      setIsAirDropped(true);
    }
  };

  return (
    <>
      <SolanaLogo />
      <WalletMultiButton />
      <button
        className=" m-4 p-4 bg-green-500 text-white font-bold rounded"
        onClick={airdropToWallet}
      >
        Airdrop 1 SOL to your test wallet
      </button>
      {isAirDropped ? <div>Sent!</div> : null}
      <div>
        {!wallet ? (
          <SelectAndConnectWalletButton onUseWalletClick={() => { }} />
        ) : (
          <PostItScreen />
        )}
      </div>
    </>
  );
};

const PostItScreen = () => {
  const wallet: any = useAnchorWallet();
  const [postits, setPostIts] = useState<unknown[]>([]);
  const { program } = useProgram({ connection, wallet });
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>();

  useEffect(() => {
    fetchPostIts();
  }, [wallet, lastUpdatedTime]);

  const fetchPostIts = async () => {
    if (wallet && program) {
      try {
        const postits = await getPostIts({
          program,
        });
        setPostIts(postits);
      } catch (error) { }
    }
  };

  const onpostitSent = (newPostIt: unknown) => {
    setPostIts((prevState) => [
      ...prevState,
      newPostIt,
    ]);
  };

  return (
    <div className="rounded-lg shadow flex">
      <div className="flex flex-col items-center justify-center">
        <div className="text-xs">
          <NetPostIt onpostitSent={onpostitSent} />
          {postits.map((t: any) => (
            <PostIt key={(t as any).key} content={t} />
          ))}
        </div>
      </div>
    </div>
  );
};

type NetPostIt = {
  onpostitSent: (t: any) => void;
};

const NetPostIt: FC<NetPostIt> = ({ onpostitSent }) => {
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  const [content, setContent] = useState<string>("");
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  const onContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    if (value) {
      setContent(value);
    }
  };

  const onPostItSendClick = async () => {
    if (!content || !program) return;
    const postit = await sendPostIt({
      wallet,
      program,
      content,
      x,
      y
    });
    setContent("");
    onpostitSent(postit);
  };

  return (
    <div className="m-4 p-4 flex">
      <textarea
        className="textarea h-24 w-full text-2xl"
        placeholder="Your PostIt!"
        value={content}
        onChange={onContentChange}
      ></textarea>
      <div>
        <button
          className="rounded-full px-16 py-4 bg-black text-white"
          onClick={onPostItSendClick}
        >
          Save!
        </button>
      </div>
    </div>
  );
};

const PostIt = ({ content }: any) => {
  console.log("content", content);
  return (
    <div className="p-2 border border-gray-500 border-b-0 flex text-xl">{content.content}</div>
  );
};

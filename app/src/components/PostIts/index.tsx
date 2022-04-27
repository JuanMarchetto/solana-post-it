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
      <nav>
        <SolanaLogo />
        <WalletMultiButton />
        <button
          className=" m-4 p-4 bg-green-500 text-white font-bold rounded"
          onClick={airdropToWallet}
        >
          Airdrop 1 SOL to your test wallet
        </button>
      </nav>
      {isAirDropped ? <div>Sent!</div> : null}
      {!wallet ? (
        <SelectAndConnectWalletButton onUseWalletClick={() => { }} />
      ) : (
        <PostItScreen />
      )}
    </>
  );
};

const PostItScreen = () => {
  const wallet: any = useAnchorWallet();
  const [postits, setPostIts] = useState<unknown[]>([]);
  const { program } = useProgram({ connection, wallet });

  useEffect(() => {
    fetchPostIts();
  }, [wallet]);

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

  const onPostitSent = (newPostIt: unknown) => {
    setPostIts((prevState) => [
      ...prevState,
      newPostIt,
    ]);
  };

  return (
    <>
      <NetPostIt onPostitSent={onPostitSent} />
      <div className="text-xs w-screen h-screen overflow-hidden m-0 p-32 bg-gray-200">
        <div className="relative m-auto border border-gray-900 w-5/6 h-[500px]">
          {postits.map((t: any) => (
            <PostIt key={(t as any).key} content={t.content} y={t.y} x={t.x} />
          ))}
        </div>
      </div>
    </>
  );
};

type NetPostIt = {
  onPostitSent: (t: any) => void;
};

const NetPostIt: FC<NetPostIt> = ({ onPostitSent }) => {
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  const [content, setContent] = useState<string>("");
  const [x, setX] = useState<number>(255);
  const [y, setY] = useState<number>(255);

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
    onPostitSent(postit);
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

const PostIt = ({ content, x, y }: any) => {
  return (
    <div
      className="p-2 border border-gray-500 border-b-0 flex text-xl w-72 h-72 bg-yellow-500 absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        top: `${y / 255 * 100}%`,
        left: `${x / 255 * 100}%`,
      }}
    >
      {content}
    </div>
  );
};

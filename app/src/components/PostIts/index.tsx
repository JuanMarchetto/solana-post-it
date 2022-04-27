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
  const wallet = useAnchorWallet();

  const airdropToWallet = async () => {
    if (wallet) {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        1000000000
      );

      const tx = await connection.confirmTransaction(signature);
      alert(`Airdrop sent to ${wallet.publicKey}`);
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center px-16 py-4 bg-black">
        <SolanaLogo />
        <WalletMultiButton />
      </nav>
      {!wallet ? (
        <SelectAndConnectWalletButton onUseWalletClick={() => { }} />
      ) : (
        <PostItScreen />
      )}
      <button
        className="m-auto mt-16 p-4 bg-green-500 text-white font-bold w-5/6 rounded block"
        onClick={airdropToWallet}
      >
        Airdrop 1 SOL to your test wallet
      </button>
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
    <div className="flex flex-col justify-center items-center">
      <NewPostIt onPostitSent={onPostitSent} />
      <div className="m-auto bg-black w-fit h-fit p-[22px] sm:p-[55px] border border-gray-500 rounded-lg">
        <div className="relative m-auto p-32 w-[200px] h-[200px] sm:w-[500px] sm:h-[500px]">
          {postits.map((t: any, i: Number) => (
            <PostIt key={i} content={t.content} y={t.y} x={t.x} />
          ))}
        </div>
      </div>
    </div>
  );
};

type NewPostIt = {
  onPostitSent: (t: any) => void;
};

const NewPostIt: FC<NewPostIt> = ({ onPostitSent }) => {
  const wallet: any = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  const [content, setContent] = useState<string>("");
  const [x, setX] = useState<number>(127);
  const [y, setY] = useState<number>(127);

  const validate = (number: any) => {
    const asIntiger = parseInt(number);
    if (asIntiger < 0) {
      return 0;
    } else if (asIntiger > 255) {
      return 255;
    }
    return asIntiger
  }

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
    <div className="w-[80%] m-4 p-4 text-white font-bold">
      <label className="w-full block">
        Write your postit here:
        <textarea
          className="my-4 p-4 bg-gray-200 rounded w-full text-black"
          placeholder="Your PostIt!"
          value={content}
          onChange={onContentChange}
          maxLength={255}
        />
      </label>
      <div className="flex justify-center items-center">
        <label>
          X:
          <input
            type="number"
            className="m-4 p-4 bg-blue-500 rounded font-bold"
            value={x}
            min="0"
            max="255"
            onChange={(e) => setX(validate(e.target.value))}
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            className="m-4 p-4 bg-blue-500 rounded font-bold"
            value={y}
            min="0"
            max="255"
            onChange={(e) => setY(validate(e.target.value))}
          />
        </label>
        <div>
          <button
            className="m-4 p-4 bg-green-500 rounded-full font-bold sm:px-16"
            onClick={onPostItSendClick}
          >
            Save!
          </button>
        </div>

      </div>
      <div className="text-xs flex justify-center">
        <em>Insert x(from top) and y(from left) coordinates between 0 and 255 to position the postit</em>
      </div>

    </div>

  );
};

const PostIt = ({ content, x, y }: any) => {
  return (
    <div
      className="p-2 border border-gray-500 flex text-xs bg-yellow-500 absolute transform overflow-hidden transition-all duration-500 ease-in-out -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%]  hover:w-[50%] hover:h-[50%] hover:z-10"
      style={{
        top: `${y / 255 * 100}%`,
        left: `${x / 255 * 100}%`,
      }}
    >
      {content}
    </div>
  );
};

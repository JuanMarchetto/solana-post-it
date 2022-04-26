import * as anchor from "@project-serum/anchor";
import { PostIt, AccountData } from "../types";

type GetPostItProps = {
  program: anchor.Program<anchor.Idl>;
  filter?: unknown[];
};

export const getPostIts = async ({ program }: GetPostItProps) => {
  const postitsRaw = await program.account.postIt.all();
  return postitsRaw.map((t: any) => 
  ({
    publicKey: t.publicKey,
    content: t.account.content,
    x: t.account.x,
    y: t.account.y,
  } as PostIt));
};

type SendPostItProps = {
  program: anchor.Program<anchor.Idl>;
  content: string;
  wallet: any;
  x: number;
  y: number;
};

export const sendPostIt = async ({
  wallet,
  program,
  content,
  x,
  y,
}: SendPostItProps) => {
  // Generate a new Keypair for our new postit account.
  const postit = anchor.web3.Keypair.generate();

  // Send a "SendPostIt" instruction with the right data and the right accounts.
  await program.rpc.sendPostit(content, x, y, {
    accounts: {
      author: wallet.publicKey,
      postit: postit.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [postit],
  });

  const newPostItAccount: AccountData = {
    content,
    x,
    y,
    };

  return {
    publicKey: postit.publicKey,
    content: newPostItAccount.content,
    x: newPostItAccount.x,
    y: newPostItAccount.y,
  } as PostIt;
};

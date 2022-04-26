import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaPostit } from "../target/types/solana_postit";
import * as assert from "assert";

describe("solana-postit", () => {
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaPostit as Program<SolanaPostit>;
  it('can send a new postit', async () => {
    const postit = anchor.web3.Keypair.generate();
    await program.rpc.sendPostit('test', 50, 50, {
        accounts: {
            postit: postit.publicKey,
            author: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [postit],
    });

    const postitAccount = await program.account.postIt.fetch(postit.publicKey);
  	console.log(postitAccount);
    assert.equal(postitAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
  });
});

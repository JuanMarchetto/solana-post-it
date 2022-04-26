use anchor_lang::prelude::*;

declare_id!("3H1vAFf2Lbv2GRhddLQXryf6Ci23ucn4DdMGFrjMFsem");

#[program]
pub mod solana_postit {
    use super::*;
    pub fn send_postit(ctx: Context<SendPostIt>, content: String, x: u8, y: u8 ) -> Result<()> {
        let postit: &mut Account<PostIt> = &mut ctx.accounts.postit;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }
        if x > 100 || y > 100 {
            return Err(ErrorCode::CoordinatesOutOfBounds.into())
        }

        postit.author = *author.key;
        postit.y = y;
        postit.x = x;
        postit.content = content;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendPostIt<'info> {
    #[account(init, payer = author, space = PostIt::LEN)]
    pub postit: Account<'info, PostIt>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PostIt {
    pub author: Pubkey,
    pub content: String,
    pub x: u8,
    pub y: u8,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const STRING_LENGTH_PREFIX: usize = 4;
const MAX_CONTENT_LENGTH: usize = 280 * 4;
const X_LENGTH: usize = 1;
const Y_LENGTH: usize = 1;

impl PostIt {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH
        + X_LENGTH + Y_LENGTH;
}

#[error_code]
pub enum ErrorCode {
    #[msg("The x and y coordinates must be between 0 and 100")]
    CoordinatesOutOfBounds,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}
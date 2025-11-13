# Memory Badges

Memory Badges is a decentralized application (dApp) that allows users to claim Soulbound Tokens (SBTs) for their on-chain and social identities. By connecting their wallet and leveraging their Memory Protocol profile, users can unlock and mint unique badges that represent their digital footprint.

## Features

- **Wallet Integration**: Seamlessly connect with popular wallets using RainbowKit.
- **Dynamic Badge Unlocking**: Fetches a user's Memory Protocol profile to determine which badges they are eligible to claim.
- **SBT Minting**: Allows users to mint their unlocked badges as Soulbound Tokens on the blockchain.
- **Claim Status**: Keeps track of which badges have already been claimed by the user.
- **Responsive UI**: A clean and modern interface built with Next.js and Tailwind CSS.
- **Shareable Profiles**: Users can share their collection of claimed badges.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Web3**:
  - [Wagmi](https://wagmi.sh/): For React hooks and wallet interactions.
  - [RainbowKit](https://www.rainbowkit.com/): For wallet connection UI.
  - [Thirdweb](https://thirdweb.com/): For smart contract interactions.
  - [Viem](https://viem.sh/): For low-level Ethereum operations.
  - [Ethers.js](https://ethers.io/): As a dependency for Web3 libraries.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Usage

To run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

1.  **Connect Wallet**: The user connects their Ethereum wallet to the application.
2.  **Fetch Profile**: The application fetches the user's profile from the Memory Protocol using their wallet address.
3.  **Unlock Badges**: Based on the user's linked social and on-chain accounts in their Memory Profile, the application determines which badges are "unlocked."
4.  **Check Claim Status**: The app checks against the smart contract to see which of the unlocked badges have already been minted by the user.
5.  **Mint Badge**: The user can choose to mint any unlocked and unclaimed badge. This triggers a transaction to the smart contract's `claim` function.
6.  **Confirmation**: Once the transaction is confirmed on the blockchain, the user's badge is successfully minted, and the UI updates to reflect the new "claimed" status.

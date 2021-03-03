# erc20-burn-relay

## Environment

Tested on `node v15.0.1`. Could work on LTS version (i.2. v12, v14)

## Configuration

Create a `.env` file in the root directory and add the following environment variables:

* `NETWORK`: `'main'` or `'kovan'`, refer to the ethereum network to read
* `START_BLOCK`: The ethereum block height to start, when the synced block height is 0 on the Phala blockchain side; otherwise the program will start from the height read from the Phala blockchain
* `END_POINT`: The Phala blockchain API endpoint (default: `'ws://127.0.0.1:9944'`)
* `API_KEY`: Etherscan API Key; required because we use their API to fetch the Ethereum blockchain history
* `ACCOUNT_URI`: The private key of a Phala address, used to send transactions to sync the burning tx

## Install

```bash
yarn
```

## Start

Make sure the Phala blockchain node is running, and start the relayer by:

```bash
yarn run start
```


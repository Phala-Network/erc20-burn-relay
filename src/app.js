const { assert } = require('chai');
const axios = require('axios');
const querystring = require('querystring');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const BN = require('bn.js');

const types = require('../config/typedefs.json');
const config = require('../config/config.json');

const ETHERSCAN_API_URL_MAP = {
    main: 'https://api.etherscan.io',
    kovan: 'https://api-kovan.etherscan.io',
};

const getTransactions = async (network, contractaddress, startblock, endblock, apikey) => {
    try {
        const module = 'account';
        const action = 'tokentx';
        const sort = 'asc';
        var queryObject = {
            module, action, contractaddress, startblock, endblock, sort, apikey
        };
        const query = ETHERSCAN_API_URL_MAP[network] + '/api?' + querystring.stringify(queryObject);
        const resp = await axios.get(query);
        const result = JSON.parse(JSON.stringify(resp.data))["result"];
        // console.log(result)
        return result;
    } catch (error) {
        console.error('[getTransactions]', error);
    }
}

const getLatestBlockNumber = async (network, apikey) => {
    try {
        const module = 'proxy';
        const action = 'eth_blockNumber';
        var queryObject = {
            module, action, apikey
        };
        const query = ETHERSCAN_API_URL_MAP[network] + '/api?' + querystring.stringify(queryObject);
        const resp = await axios.get(query);
        const result = JSON.parse(JSON.stringify(resp.data))["result"];
        // console.log(result)
        return result;
    } catch (error) {
        console.error('[getLatestBlockNumber]', error);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function assertSuccess(txBuilder, signer) {
    return await new Promise(async (resolve, _reject) => {
        const unsub = await txBuilder.signAndSend(signer, (result) => {
            if (result.status.isInBlock) {
                let error;
                for (const e of result.events) {
                    const { event: { data, method, section } } = e;
                    if (section === 'system' && method === 'ExtrinsicFailed') {
                        error = data[0];
                    }
                }
                if (error) {
                    assert.fail(`Extrinsic failed with error: ${error}`);
                }
                unsub();
                resolve({
                    hash: result.status.asInBlock,
                    events: result.events,
                });
            } else if (result.status.isInvalid) {
                assert.fail('Invalid transaction');
                unsub();
                resolve();
            }
        });
    });
}

const worker = async () => {
    const network = config.network;
    const contractAddress = config.contract;
    const defultStartBlock = config.startBlock;
    const apikey = config.apiKey;

    const wsEndPoint = config.endPoint;
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({provider: wsProvider, types});
    await cryptoWaitReady();

    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri(config.accountURI);
    const info = await api.query.system.account(alice.address);
    let nonce = info.nonce.toNumber();

    const delayBlockNum = 15;
    const endHeight = await api.query.phaClaim.endHeight();
    let startBlock = endHeight.toNumber()
    if (startBlock === 0) {
        startBlock = defultStartBlock
    }
    let latestBlock = await getLatestBlockNumber(network, apikey);
    let nowBlock = startBlock + 1;

    while (true) {
        if (latestBlock - delayBlockNum >= nowBlock) {
            console.log(`[worker] crawl ${nowBlock}`);
            let txs = await getTransactions(network, contractAddress, nowBlock, nowBlock, apikey);
            let len = txs.length;
            let claims = new Array();
            for (i = 0; i < len; i++) {
                let tx = txs[i];
                if('0x000000000000000000000000000000000000dead' === tx['to']) {
                    let amount = new BN(tx['value']);
                    amount = amount.divn(1e+6)
                    claims[i] = [tx['hash'], tx['from'], amount];
                    console.log(claims[i], tx['blockNumber']);
                }
            }
            if(claims.length > 0) {
                await assertSuccess(api.tx.phaClaim.storeErc20BurnedTransactions(nowBlock, claims), alice);
                    //.signAndSend(alice, {nonce:nonce}));
                nonce = nonce+1;
            }
            nowBlock = nowBlock + 1;
            await sleep(1000);
        }
        else {
            console.log("[worker] wait 6s");
            await sleep(6000);
        }
    }
}

worker()


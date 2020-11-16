require('dotenv').config();
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const types = require('../config/typedefs.json');

const assertSuccess = async(txBuilder, signer) => {
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
                    throw new Error(`Extrinsic failed : ${error}`);
                }
                unsub();
                resolve({
                    hash: result.status.asInBlock,
                    events: result.events,
                });
            } else if (result.status.isInvalid) {
                throw new Error('Invalid transaction');
                unsub();
                resolve();
            }
        });
    });
}

const setRelayer = async () => {
    const wsEndPoint = process.env.END_POINT;
    const wsProvider = new WsProvider(wsEndPoint);

    const api = await ApiPromise.create({provider: wsProvider, types});
    await cryptoWaitReady();

    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri(process.env.ACCOUNT_URI);
    await assertSuccess(api.tx.sudo.sudo(
        api.tx.phaClaim.changeRelayer(alice.address)),
        alice);
    console.log("success");
}

setRelayer();

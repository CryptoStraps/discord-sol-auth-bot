
var express = require('express');
const {Connection, PublicKey} = require('@solana/web3.js');
const { sleep } = require('../util/sleep');
const { Base64 } = require( "js-base64");
const request = require( "request-promise");
const { tokenAuthFetchMiddleware } = require("@strata-foundation/web3-token-auth");
require("dotenv").config();

const getToken = async () => {
  const token = Base64.encode(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  );
  try {
    const { token_type, access_token } = await request({
      uri: `${process.env.ISSUER}/token`,
      json: true,
      method: "POST",
      headers: {
        authorization: `Basic ${token}`,
      },
      form: {
        grant_type: "client_credentials",
      },
    });
    console.log({ token_type, access_token });
    return access_token;
  } catch (e) {
    console.log(e);
  }

}

const connection = new Connection('https://alice.genesysgo.net', {
  fetchMiddleware: tokenAuthFetchMiddleware({ getToken }),
  confirmTransactionInitialTimeout: 180000,
});
let before;
const txs = new Map();
const cache = {};

(async () => {
  while (true) {   
    try {

    const tx = await connection.getSignaturesForAddress(
      new PublicKey('7oZm7RjNc7hr6ZYhe7rGQqsVbA1kD1C5sLR59bFUKX3G'),
      { limit: 1000, before }
    );
    for (const t of tx) {
      if (!t) {
        return;
      }

      if (t.memo) {
        let resolved;
        while (!resolved) {
          resolved = await connection.getTransaction(t.signature);
        }
        const signerPreBalance = resolved?.meta.preTokenBalances.find(token => token.mint === 'EEhosSQvC2yVDRXRGpkonGFF2WNjtUdzb48GV8TSmhfA' && token.owner !== 'gunzzzqPKDF4ZpURLdJF9L6X1iCtKtZxkzoCU9MhGav');
        const signerPostBalance = resolved?.meta.postTokenBalances.find(token => token.mint === 'EEhosSQvC2yVDRXRGpkonGFF2WNjtUdzb48GV8TSmhfA' && token.owner !== 'gunzzzqPKDF4ZpURLdJF9L6X1iCtKtZxkzoCU9MhGav');
        if (signerPostBalance.uiTokenAmount.uiAmount - signerPreBalance.uiTokenAmount.uiAmount >= 1500) {
          const address = t.memo?.split('] ')[1]?.split(':')[0];
          const mint = t?.memo?.split('] ')[1]?.split(':')[1];
          if (!cache[address]) {
            cache[address] = [];
          }
          cache[address].push(mint);
          cache[address] = [...new Set(cache[address])];
        }
      }
    }
    const vals = [...txs.values()];
    console.log(...vals)
    const sorted = [...vals].sort((a, b) => b.blockTime - a.blockTime);
    if (Object.keys(cache).length) {
      before = sorted[sorted.length - 1]?.signature;
    }
    await sleep(1000);
    } catch (e) {
      console.log(e)
    }
    console.log(JSON.stringify(cache));
  }
})();

setInterval(() => {
  process.exit(0)
}, 300000);
var router = express.Router();

router.get('/', async function (req, res, next) {
  const { address } = req.query;
  const mints = cache[address];
  if (mints) {
    res.status(200).send(mints);
  } else {
    res.status(200).send([]);

  }

});
module.exports = router;

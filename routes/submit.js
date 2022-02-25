const {logToDiscord} = require("./_discord");
var express = require('express');
const nacl = require('tweetnacl');
const { PublicKey } = require("@solana/web3.js");
var router = express.Router();


router.get('/', async function (req, res, next) {
  const { signature, pubkey, discordId, discordHandle } = req.query;
  var buf = new TextEncoder().encode(discordId);
  console.log(Uint8Array.from(signature.split(',')))
  const verified = nacl.sign.detached.verify(
    buf,
    Uint8Array.from(signature.split(',')),
    new PublicKey(pubkey).toBytes()
  );
  if (verified) {
    logToDiscord(`
Submission completed!
User: ${discordHandle}
User-ID: ${discordId}
Pubkey: ${pubkey}
Signed Message: [${signature}]
`);
    res.status(200).send({ success: true });
  }
});
module.exports = router;

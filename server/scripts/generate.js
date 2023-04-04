const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();

console.log("Private Key: ", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);
const address = toHex(keccak256(publicKey.slice(1)).slice(-20));

console.log("Address: ", address);
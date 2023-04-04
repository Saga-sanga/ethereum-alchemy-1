import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

export function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

export async function signMessage(msg, privateKey) {
  // console.log(privateKey);
  return await secp.sign(hashMessage(msg), privateKey);
}
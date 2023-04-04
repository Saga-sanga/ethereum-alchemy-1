import { useEffect, useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { signMessage } from "./processMessage";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState([]);
  let publicKey;

  const setValue = (setter) => (evt) => setter(evt.target.value);

    try {
      publicKey = secp.getPublicKey(privateKey);
    } catch (error) {
      console.log(error)
    }

  // function setValue(setter) {
  //   return function(evt) { setter(evt.target.value)}  
  // }
  function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
  }

  // TODO: Create Message containing transaction details. Send all info as hexadecimal string to maintain integrity of data

  async function transfer(evt) {
    evt.preventDefault();
    console.log(address);
    const sig = await signMessage(sendAmount, privateKey);
    console.log("Signature: ", sig);
    const hashSig = toHex(sig);
    const hashPub = toHex(publicKey);
    console.log(toHex(hashMessage(sendAmount)));
    setSignature(hashSig);

    try {
      // Nested destructuring: pull data from response and then pull balance from data
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: sendAmount,
        hash: toHex(hashMessage(sendAmount)),
        recipient,
        signature,
        hashPub
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Signature: {signature}
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

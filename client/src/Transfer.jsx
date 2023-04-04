import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { signMessage } from "./processMessage";
import { toHex } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sign, setSign] = useState("");
  let publicKey;

  const setValue = (setter) => (evt) => setter(evt.target.value);

  try {
    publicKey = secp.getPublicKey(privateKey);
  } catch (error) {
    console.log(error)
  }

  // TODO: Create Message containing transaction details. Send all info as hexadecimal string to maintain integrity of data

  async function transfer(evt) {
    evt.preventDefault();

    // console.log(recipient, address);
    const message = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
      time: new Date().getTime()
    }

    // Sign message with private key. Method returns a Uint8Array Hash
    const sig = await signMessage(JSON.stringify(message), privateKey);
    // console.log("Signature: ", sig);

    // Convert the signature to hexadecimal string
    const signature = toHex(sig);
    const hashPub = toHex(publicKey);
    setSign(signature);

    try {
      // Nested destructuring: pull data from response and then pull balance from data
      const {
        data: { balance },
      } = await server.post(`send`, {
        message,
        signature,
        hashPub
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
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
        Signature: {sign.slice(0, 10)}...{sign.slice(-10)}
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex, hexToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

// Private Key:  66b7dab8ff39bc8d1c9aed6bca6975b4f9c49e61bcafc41dc003d38d30c51360
// Address:  2d276580c79930d4d2334927d5564939bff3deb4
// Private Key:  ba308bef941f35f10dcaff65c1a1d2aa2b31e0e5a812e2be5e82ab0b2e154438
// Address:  4a2327762f67cb2f22beefcbf0773cb7a4a79b60
// Private Key:  5ccaef952820d1bc4ae7470ac4de62c979daa590f75eb7dee8ae013bd57c451b
// Address:  ffb32983363d0b1fabc98808a8c6bb0ed0802347

const balances = {
  "2d276580c79930d4d2334927d5564939bff3deb4": 100,
  "4a2327762f67cb2f22beefcbf0773cb7a4a79b60": 50,
  "ffb32983363d0b1fabc98808a8c6bb0ed0802347": 75,
};

app.get("/", (req, res) => {
  console.log("hit")
  res.send({...balances});
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, signature, hashPub } = req.body;
  const {sender, recipient, amount} = message;

  //Create a hexadecimal string form the hash of the message
  const hashMsg = hashMessage(JSON.stringify(message));
  
  const isSigned = secp.verify(signature, hashMsg, hashPub);
  console.log(isSigned);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if  (isSigned) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Invalid Signature"})
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function hashMessage(message) {
  return keccak256(utf8ToBytes(message));
}

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const web3 = new Web3(Web3.givenProvider);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/nonce", async (req, res) => {
  const { address } = req.body;

  const nonce = await generateNonce(address);

  res.status(200).json({ nonce });
});

app.post("/login", async (req, res) => {
  try {
    const { signature, nonce } = req.body;

    const address = await getAddressByNonce(nonce);

    const msg = `nonce:${nonce}`;
    const signedMsg = web3.eth.accounts.recover(msg, signature);
    const recoveredAddress = signedMsg.toLowerCase();

    if (recoveredAddress === address.toLowerCase()) {
      await clearNonce(nonce)
      res.status(200).send("Login validated");
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// =======

let storage = {};

async function generateNonce(address) {
  const nonce = uuidv4();

  storage[nonce] = address;

  return nonce;
}

async function getAddressByNonce(nonce) {
  return storage[nonce];
}

async function clearNonce(nonce) {
  delete storage[nonce]
}
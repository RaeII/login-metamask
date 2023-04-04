async function getAuthNonce(account) {
  const response = await fetch("/nonce", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address: account,
    }),
  });

  const data = await response.json();
  return data.nonce;
}

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      status.innerText = `Connected to Metamask with address: ${account}`;

      const nonce = await getAuthNonce(account);

      const message = `nonce:${nonce}`;

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature,
          address: account,
          nonce,
        }),
      });

      if (response.ok) {
        console.log("Login validated");
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.error(error);
      status.innerText = "Error connecting to Metamask";
    }
  } else {
    status.innerText = "Please install Metamask to use this feature";
  }
}

const ethereumButton = document.querySelector("#connect-button");
const status = document.querySelector("#status");

ethereumButton.addEventListener("click", () => {
  connectWallet();
});

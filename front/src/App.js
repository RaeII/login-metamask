import './App.css';
import axios from "axios"
import { useState } from "react";

function App() {

  const [metamaskConnect,setMetamaskConnect] = useState(null)

  async function connectWallet() {
    if (window.ethereum) {
      try {

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
  
        const account = accounts[0];
        console.log(`Connected to Metamask with address: ${account}`);
  
        const nonce = await getAuthNonce(account);
  
        const message = `nonce:${nonce}`;
  
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, account],
        });
  
        const response = await axios.post("http://localhost:3000/authorization",{
          signature,
          address: account,
          nonce,
        });
  
        if (response.data) {
          console.log("Login validated");
        } else {
          console.log("Login failed");
        }

        setMetamaskConnect(account)

      } catch (error) {
        console.error(error);
        console.log("Error connecting to Metamask");
      }
    } else {
      console.log("Please install Metamask to use this feature");
    }
  }

  async function getAuthNonce(account) {
    const response = await axios.post("http://localhost:3000/nonce",{
        address: account
    });
  
    const data = await response.data;
    return data.nonce;
  }

  return (
    <div className="App">
      <main>
        <h2>authentication Login</h2>
		    <button
          onClick={e => connectWallet()} 
          className="btn"
        >
          {!metamaskConnect ? 
            ('Authorize with Metamask'):
            ('Authorized')
          }  
        </button>

        {metamaskConnect && (
           <p id="status">{`Authorized Metamask with address: ${metamaskConnect}`}</p>
        )}
      </main>
    </div>
  );
}

export default App;

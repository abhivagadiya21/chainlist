import React, { useEffect, useState } from "react";
import axios from "axios";
import useAccount from "./useAccount";

const Popup = ({ open, setOpen, rpcList }) => {
  const [rpcData, setRpcData] = useState([]);
  const [copied, setCopied] = useState(null);
  const { data: accountData } = useAccount();
  const address = accountData?.address ?? null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const fetchChain = async (baseURL) => {
    if (baseURL.includes("API_KEY")) return null;
    try {
      const API = axios.create({
        baseURL,
        headers: { "Content-Type": "application/json" },
      });

      API.interceptors.request.use((request) => {
        request.requestStart = Date.now();
        return request;
      });

      API.interceptors.response.use(
        (response) => {
          response.latency = Date.now() - response.config.requestStart;
          return response;
        },
        (error) => {
          if (error.response) {
            error.response.latency = null;
          }
          return Promise.reject(error);
        }
      );

      const rpcBody = {
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", false],
        id: 1,
      };

      const { data, latency } = await API.post("", rpcBody);

      if (data?.result) {
        let trust = "red";
        if (latency < 100) trust = "green";
        else if (latency < 300) trust = "lightgreen";
        else if (latency < 600) trust = "orange";
        else trust = "red";

        return {
          address: baseURL,
          blockNumber: parseInt(data.result.number, 16),
          latency,
          trust,
        };
      } else {
        return {
          address: baseURL,
          blockNumber: "Error",
          latency: "N/A",
          trust: "red",
        };
      }
    } catch (error) {
      return {
        address: baseURL,
        blockNumber: "Error",
        latency: "N/A",
        trust: "red",
      };
    }
  };

  useEffect(() => {
    if (!rpcList?.length) return;
    const getBlockNumbers = async () => {
      const results = await Promise.all(rpcList.map(fetchChain));
      setRpcData(results);
    };
    getBlockNumbers();
  }, [rpcList]);

  if (!open) return null;

  return (
    <TableComponent
      rpcData={rpcData}
      setOpen={setOpen}
      copied={copied}
      copyToClipboard={copyToClipboard}
      address={address}
      connectWallet={() => alert("Connect wallet function not implemented")}
    />
  );
};

const PrivacyIcon = ({ address }) => {
  return address.startsWith("https://") ? (
    <span title="Secure (HTTPS)">🔒</span>
  ) : (
    <span title="Less Secure (HTTP)">⚠️</span>
  );
};

const TableComponent = ({
  rpcData,
  copied,
  copyToClipboard,
  setOpen,
  address,
  connectWallet,
}) => {
  const addToMetaMask = async (rpcUrl) => {
    const chainId = "1337"; 
    const chainName = "MyChain"; 
    const chain = "MCH"; 
    const icon = ""; 

    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${parseInt(chainId).toString(16)}`,
            chainName: chainName,
            nativeCurrency: {
              name: chainName,
              symbol: chain,
              decimals: 18,
            },
            rpcUrls: [rpcUrl],
            blockExplorerUrls: [],
            iconUrls: [icon],
          },
        ],
      });
    } catch (error) {
      console.error("Error adding chain to MetaMask:", error);
    }
  };

  return (
    <div className="popup-overlay" onClick={() => setOpen(false)}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h1>Base RPC URL List</h1>
        <table>
          <thead>
            <tr>
              <th>RPC Server Address</th>
              <th>Height</th>
              <th>Latency (ms)</th>
              <th>Score</th>
              <th>Privacy</th>
              <th>Connect Wallet</th>
            </tr>
          </thead>
          <tbody>
            {rpcData
              .filter(Boolean)
              .sort((a, b) =>
                a.latency === "N/A"
                  ? 1
                  : b.latency === "N/A"
                  ? -1
                  : a.latency - b.latency
              )
              .map((rpc, index) => (
                <tr key={index}>
                  <td>
                    <button
                      className="address-copy-btn"
                      onClick={() => copyToClipboard(rpc.address)}
                    >
                      {rpc.address} {copied === rpc.address ? "✅ Copied!" : ""}
                    </button>
                  </td>
                  <td>{rpc.blockNumber}</td>
                  <td>
                    {rpc.latency !== "N/A" ? `${rpc.latency} ms` : "Error"}
                  </td>
                  <td>
                    {rpc.trust === "green"
                      ? "🟢"
                      : rpc.trust === "lightgreen"
                      ? "🟡"
                      : rpc.trust === "orange"
                      ? "🟠"
                      : "🔴"}
                  </td>
                  <td>
                    <PrivacyIcon address={rpc.address} />
                  </td>
                  <td>
                    {address ? (
                      <button
                        className="btn-table"
                        onClick={() => addToMetaMask(rpc.address)}
                      >
                        <span>Add to network</span>
                      </button>
                    ) : (
                      <button className="btn-table2" onClick={connectWallet}>
                        Connect wallet
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <button className="btn-close" onClick={() => setOpen(false)}>Close</button>
      </div>
    </div>
  );
};

export { TableComponent };

export default Popup;

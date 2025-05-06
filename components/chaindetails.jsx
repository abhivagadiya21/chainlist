import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from "axios";
import '../components/Chaindetails.css';
import Chainlogo from '../src/assets/Chainlogo.svg'
import Pulslogo from '../src/assets/Pulslogo.svg'
import Pulslogo2 from '../src/assets/Pulslogo2.svg'
import { walletIcons } from './walletIcons'
import useConnect from './connectwallet'
import useAccount from './useAccount'
import { formatAddress, getProvider } from './address'
import { useQuery } from "@tanstack/react-query";

function Chaindetails() {

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const chainName = params.get("name");
  const chainId = params.get("chainId");
  const chain = params.get("chain");
  const icon = params.get("icon")

  const [searchItem, setSearchItem] = useState('');
  const [rpcData, setRpcData] = useState([]);
  const [copied, setCopied] = useState(null);
  const [rpcList, setRpcList] = useState([]);
  const { mutate: connectWallet } = useConnect();
  const { data: accountData } = useAccount();
  const address = accountData?.address ?? null;
  const [selectedRpc, setSelectedRpc] = useState(null);
  const [blockGasLimit, setBlockGasLimit] = useState(0);

  useEffect(() => {
    console.log("address", address, accountData)
  }, [address, accountData])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };
  let getIconLink = function (chain) {
    return chain.icon ? `https://icons.llamao.fi/icons/chains/rsz_${chain.icon}.jpg` : "https://chainlist.org/unknown-logo.png"
  }

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

        if(data?.result  && data.result.gasLimit) {
          setBlockGasLimit(data.result.gasLimit)
        }

        return {
          address: baseURL,
          blockNumber: parseInt(data.result.number, 16),
          latency,
          trust
        };
      } else {
        return { address: baseURL, blockNumber: "Error", latency: "N/A", trust: "red" };
      }
    } catch (error) {
      return { address: baseURL, blockNumber: "Error", latency: "N/A", trust: "red" };
    }
  };

  useEffect(() => {
    const getChainAndRPCs = async () => {
      try {
        const response = await axios.get("https://chainid.network/chains.json");
        const allChains = response.data;
        const selectedChain = allChains.find((c) => String(c.chainId) === chainId);
        if (selectedChain && selectedChain.rpc && selectedChain.rpc.length > 0) {
          const cleanRPCs = selectedChain.rpc.filter(url => !url.includes("${") && !url.includes("API_KEY"));
          setRpcList(cleanRPCs);

          const results = await Promise.all(cleanRPCs.map(fetchChain));
          setRpcData(results.filter(Boolean));
        } else {
          console.log("No RPCs found for this chain.");
        }
      } catch (error) {
        console.error("Failed to fetch chain data:", error);
      }
    };

    if (chainId) {
      getChainAndRPCs();
    }
  }, [chainId]);

  const PrivacyIcon = ({ address }) => {
    return address.startsWith("https://") ? (
      <span title="Secure (HTTPS)">🔒</span>
    ) : (
      <span title="Less Secure (HTTP)">⚠️</span>
    );

  };
  const TrustScoreIcon = ({ trust }) => {
    let icon = "⚠️";
    let color = "red";

    switch (trust) {
      case "green":
        icon = "🟢";
        color = "green";
        break;
      case "lightgreen":
        icon = "🟡";
        color = "#ADFF2F";
        break;
      case "orange":
        icon = "🟠";
        color = "orange";
        break;
      case "red":
      default:
        icon = "🔴";
        color = "red";
        break;
    }

    return <span title={`Trust score: ${trust}`} style={{ color }}>{icon}</span>;

  };

  // const { data: blockGasLimit } = useQuery({
  //   queryKey: ["blockGasLimit", chain?.rpc?.[0]],
  //   queryFn: () => fetchBlockGasLimit(chain?.rpc?.[0]?.url),
  // });

  // async function fetchBlockGasLimit(rpc) {
  //   if (!rpc) return null;
  //   try {
  //     const response = await fetch(rpc, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         jsonrpc: "2.0",
  //         method: "eth_getBlockByNumber",
  //         params: ["latest", false],
  //         id: 1,
  //       }),
  //     });
  //     const data = await response.json();
  //     if (data.result && data.result.gasLimit) {
  //       console.log(data.result.gasLimit)
  //       return parseInt(data.result.gasLimit, 16);
  //     }
  //     return "Unknown";
  //   } catch (error) {
  //     console.error("Error fetching block gas limit:", error);
  //   }
  // }

  return (
    <>
      <div className='flex-container'>
        <div className='flex-item-left'>

          <div className='logo-container'>
            <img src={Chainlogo} className='chainlogo' />
            <div className='heding-h1'>
              <p >Helping users connect to EVM-<br />powered networks</p>
            </div>

            <div className='heding-p'>
              <p>ChainList is a list of EVM networks. Users can use the<br /> information to connect their wallets and Web3 middleware<br /> providers to the appropriate Chain ID and Network ID to<br /> connect to the correct chain.</p>
            </div>
            <div>
              <button className="button-network">
                <div className='text-svg-contenar'>
                  <div className='button-span'>
                    <p>Add Your Network</p>
                  </div>
                  <div>
                    <img src={Pulslogo} className='pulslogo svg-img' />
                  </div>
                </div>
              </button>
            </div>
            <div>
              <button className="button-RPC "><p className='button-span-RPC'>Add Your RPC
                <img src={Pulslogo2} className='pulslogo svg-img' />
              </p></button>
            </div>

            <div className='git-conteanr'>
              <svg version="1.1" className="w-6 h-6 git-img" viewBox="0 0 24 24"
                width="24px"
                height="24px"
              >
                <path
                  fill={"#2F80ED"}
                  d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                />
              </svg>
              <div className='git-img-text'>
                <p>View Code</p>
              </div>
            </div>
          </div>
        </div>

        <div className='flex-item-right'>
          <div className='right-margin'>
            <div className='search-button-contenar'>
              <div className='search-contenar'>
                <div className='seaech-text'>
                  <p>Search Networks</p>
                </div>
                <div className='search-input-contenar'>
                  <input
                    placeholder='ETH, Fantom, ...'
                    className='search-input'
                    value={searchItem}
                    onChange={(e) => setSearchItem(e.target.value)}
                  />
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" className='search-icon'>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </div>
              </div>
              <div className='checkbox-button-contenar'>
                <div className='checkbox-button'>
                  <input
                    type="checkbox"
                  />
                </div>
                <div className='checkbox-text'>
                  <span>Include Testnets</span>
                </div>
                <div className='button-contenar'>

                  {address ? <>
                    <button className="button">
                      <img src={walletIcons[getProvider()]} width={20} height={20} alt="" />
                      <span>{formatAddress(address)}</span> </button></>
                    : <>
                      <button className="button" onClick={connectWallet}>Connect wallet</button>
                    </>}
                </div>
              </div>
            </div>

            <div className='main-contenar'>
              <div className="card-chain">
                <div className="card-header">
                  <img src={getIconLink({ icon: chain })} alt={chain} className='icon-img' />
                  <h2>{chainName}</h2>
                </div>
                <div className="card-body">
                  <div className="info">
                    <span>ChainID</span>
                    <strong>{chainId}</strong>
                  </div>
                  <div className="info">
                    <span>Currency</span>
                    <strong>{chain}</strong>
                  </div>
                  <div className="info">
                    <span>Block Gas Limit</span> 
                    <strong>{blockGasLimit ? parseInt(blockGasLimit, 16) : "Unknown"}</strong>

                  </div>
                </div>
                {address ? (
                  <button
                    className="btn-network"
                    onClick={() => addToMetaMask(selectedRpc)}
                    disabled={!selectedRpc}
                  >
                    <span>Add to network</span>
                  </button>
                ) : (
                  <button className="connect-wallet" onClick={connectWallet}>
                    Connect wallet
                  </button>
                )}
              </div>

              {rpcData.length > 0 && (
                <div className="card-table">
                  <h2>RPC Server Table</h2>
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
                         a.latency === "N/A " ? 1 : b.latency === "N/A" ? -1 : a.latency - b.latency
                       ).map((rpc, idx) => (
                        <tr key={idx}>
                          <td>
                            <button onClick={() => copyToClipboard(rpc.address)} className="btn-rpc">
                              {rpc.address} {copied === rpc.address && "✅"}
                            </button>
                          </td>
                          <td>{rpc.blockNumber}</td>
                          <td>{rpc.latency}</td>
                          <td><TrustScoreIcon trust={rpc.trust} /></td>
                          <td><PrivacyIcon address={rpc.address} /></td>
                          <td>{address ? (
                            <button className="btn-table" onClick={() => addToMetaMask(rpc.address)}>
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
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Chaindetails;
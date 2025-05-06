import React, { useEffect, useState } from 'react';
import Popup from './popup';
import 'reactjs-popup/dist/index.css';
import useConnect from './connectwallet'
import useAccount from './useAccount'
import { formatAddress, getProvider } from './address'
import { walletIcons } from './walletIcons'
import Chainlogo from '../src/assets/Chainlogo.svg'
import Pulslogo from '../src/assets/Pulslogo.svg'
import Pulslogo2 from '../src/assets/Pulslogo2.svg'
import { useNavigate } from "react-router-dom";
import "../components/chain.css"

export default function Chain() {

  const [open, setOpen] = useState(false);
  const [rpcList, setRpcList] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [includeTestnets, setIncludeTestnets] = useState(false);
  const { mutate: connectWallet } = useConnect();
  const [chaindata, setchainData] = useState([]);
  const { data: accountData } = useAccount();
  const address = accountData?.address ?? null;
  const navigate = useNavigate();

  const handlesignupb = (name, chainId, chain, icon) => {
    const queryString = new URLSearchParams({ name, chainId, chain, icon }).toString();
    navigate(`/Chaindetails?${queryString}`);
  };

  useEffect(() => {
    console.log("address", address, accountData)
  }, [address, accountData])

  useEffect(() => {
    fetch('https://chainid.network/chains.json')
      .then((response) => response.json())
      .then((chaindataRes) => {
        setchainData(chaindataRes)
      })
  }, []);

  const filteredChains = chaindata.filter((chain) => {
  const search = searchItem.toLowerCase();
  const matchesSearch =
      chain.name?.toLowerCase().includes(search) 
      chain.chain?.toLowerCase().includes(search);    
  const isTestnet = chain.testnet === true;
  const isMainnet = !isTestnet;

    if (includeTestnets) {
      return matchesSearch; 
    } else {
      return matchesSearch && isMainnet;  
    }
  });

  let getIconLink = function (chain) {
    return chain.icon ? `https://icons.llamao.fi/icons/chains/rsz_${chain.icon}.jpg` : "https://chainlist.org/unknown-logo.png"
  }

  useEffect(() => {
    console.log(chaindata)
  }, [chaindata])

  return (
    <>
      <div className='flex-container'>
        <div className='flex-item-left'>
          <div className='logo-container'>
            <img src={Chainlogo} className='chainlogo' />
            <div className='heding-h1'>
              <p>Helping users connect to EVM-<br />powered networks</p>
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
              <svg version="1.1" className="w-6 h-6 git-img" viewBox="0 0 24 24" width="24px" height="24px">
                <path fill={"#2F80ED"} d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <div className='git-img-text'><p>View Code</p></div>
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
                    checked={includeTestnets}
                    onChange={() => setIncludeTestnets(!includeTestnets)} 
                  />
                </div>
                <div className='checkbox-text'>
                  <span>Include Testnets</span>
                </div>
                <div className='button-contenar'>
                  {address ? (
                    <button className="button">
                      <img src={walletIcons[getProvider()]} width={20} height={20} alt="" />
                      <span>{formatAddress(address)}</span>
                    </button>
                  ) : (
                    <button className="button" onClick={connectWallet}>Connect wallet</button>
                  )}
                </div>
              </div>
            </div>

            <div className='main-contenar'>
              {filteredChains.map((item) => {
                return (
                  <div className='chain-contenar' key={item.chainId}>
                    <div className="card">
                      <img src={getIconLink(item)} alt={item.chain} className='icon-img' />
                      <div className="title" onClick={() => handlesignupb(item.name, item.chainId, item.chain, item.icon)}>{item.name}</div>
                      <div className="details">ChainID: <span>{item.chainId}</span></div>
                      <div className="details">Currency: <span>{item.chain}</span></div>

                      {address ? (
                        <button className="btn-network">
                          <span>add to network</span>
                        </button>
                      ) : (
                        <button className="btn-Connect" onClick={connectWallet}>Connect wallet</button>
                      )}
                      <div>
                        <button
                          type="button"
                          className="button-rpclist"
                          onClick={() => {
                            setOpen(o => !o);
                            setRpcList(item.rpc);
                          }}
                        >
                          RPC list
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Popup open={open} setOpen={setOpen} rpcList={rpcList} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

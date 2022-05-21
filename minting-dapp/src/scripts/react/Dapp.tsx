import React from 'react';
import { ethers, BigNumber } from 'ethers'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import NftContractType from '../lib/NftContractType';
import CollectionConfig from '../../../../smart-contract/config/CollectionConfig';
import NetworkConfigInterface from '../../../../smart-contract/lib/NetworkConfigInterface';
import CollectionStatus from './CollectionStatus';
import MintWidget from './MintWidget';
import Whitelist from '../lib/Whitelist';



const ContractAbi = require('../../../../smart-contract/artifacts/contracts/' + CollectionConfig.contractName + '.sol/' + CollectionConfig.contractName + '.json').abi;

interface Props {
}

interface State {
  userAddress: string|null;
  network: ethers.providers.Network|null;
  networkConfig: NetworkConfigInterface;
  totalSupply: number;
  maxSupply: number;
  maxMintAmountPerTx: number;
  tokenPrice: BigNumber;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  merkleProofManualAddress: string;
  merkleProofManualAddressFeedbackMessage: string|JSX.Element|null;
  errorMessage: string|JSX.Element|null;
}

const defaultState: State = {
  userAddress: null,
  network: null,
  networkConfig: CollectionConfig.mainnet,
  totalSupply: 0,
  maxSupply: 0,
  maxMintAmountPerTx: 0,
  tokenPrice: BigNumber.from(0),
  isPaused: true,
  isWhitelistMintEnabled: false,
  isUserInWhitelist: false,
  merkleProofManualAddress: '',
  merkleProofManualAddressFeedbackMessage: null,
  errorMessage: null,
};

export default class Dapp extends React.Component<Props, State> {
  provider!: Web3Provider;

  contract!: NftContractType;

  private merkleProofManualAddressInput!: HTMLInputElement;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount = async () => {
    const browserProvider = await detectEthereumProvider() as ExternalProvider;

    if (browserProvider?.isMetaMask !== true) {
      this.setError( 
        <>
          We were not able to detect <strong>MetaMask</strong>. We value <strong>privacy and security</strong> a lot so we limit the wallet options on the dapp.<br />
        </>,
      );
    }

    this.provider = new ethers.providers.Web3Provider(browserProvider);

    this.registerWalletEvents(browserProvider);

    await this.initWallet();
  }

  async mintTokens(amount: number): Promise<void>
  {
    try {
      await this.contract.mint(amount, {value: this.state.tokenPrice.mul(amount)});
    } catch (e) {
      this.setError(e);
    }
  }

  async whitelistMintTokens(amount: number): Promise<void>
  {
    try {
      await this.contract.whitelistMint(amount, Whitelist.getProofForAddress(this.state.userAddress!), {value: this.state.tokenPrice.mul(amount)});
    } catch (e) {
      this.setError(
          <>
              Maximum Whitelist Mint Allowance (10) Claimed!
          </>,
      );
    }
  }

  private isWalletConnected(): boolean
  {
    return this.state.userAddress !== null;
  }

  private isContractReady(): boolean
  {
    return this.contract !== undefined;
  }

  private isSoldOut(): boolean
  {
    return this.state.maxSupply !== 0 && this.state.totalSupply < this.state.maxSupply;
  }

  private isNotMainnet(): boolean
  {
    return this.state.network !== null && this.state.network.chainId !== CollectionConfig.mainnet.chainId;
  }

  private copyMerkleProofToClipboard(): void
  {
    const merkleProof = Whitelist.getRawProofForAddress(this.state.userAddress ?? this.state.merkleProofManualAddress);

    if (merkleProof.length < 1) {
      this.setState({
        merkleProofManualAddressFeedbackMessage: 'The given address is not in the whitelist, please double-check.',
      });

      return;
    }

    navigator.clipboard.writeText(merkleProof);

    this.setState({
      merkleProofManualAddressFeedbackMessage: 
      <>
        <strong>Congratulations!</strong> <span className="emoji">🎉</span><br />
        Your Merkle Proof <strong>has been copied to the clipboard</strong>. You can paste it into <a href={this.generateContractUrl()} target="_blank">{this.state.networkConfig.blockExplorer.name}</a> to claim your tokens.
      </>,
    });
  }

  render() {
    return (
      <>   
        {this.isNotMainnet() ?
          <div className="not-mainnet">
            You are not connected to the main network.
            <span className="small">Current network: <strong>{this.state.network?.name}</strong></span>
          </div>
          : null}

        {this.state.errorMessage ? <div className="error"><p>{this.state.errorMessage}</p><button onClick={() => this.setError()}>Close</button></div> : null}
        
        {this.isWalletConnected() ?
          <>
            {this.isContractReady() ?
              <>
                <CollectionStatus
                  userAddress={this.state.userAddress}
                  maxSupply={this.state.maxSupply}
                  totalSupply={this.state.totalSupply}
                  isPaused={this.state.isPaused}
                  isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                  isUserInWhitelist={this.state.isUserInWhitelist}
                />
                {this.state.totalSupply < this.state.maxSupply ?
                  <MintWidget
                    networkConfig={this.state.networkConfig}
                    maxSupply={this.state.maxSupply}
                    totalSupply={this.state.totalSupply}
                    tokenPrice={this.state.tokenPrice}
                    maxMintAmountPerTx={this.state.maxMintAmountPerTx}
                    isPaused={this.state.isPaused}
                    isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                    isUserInWhitelist={this.state.isUserInWhitelist}
                    mintTokens={(mintAmount) => this.mintTokens(mintAmount)}
                    whitelistMintTokens={(mintAmount) => this.whitelistMintTokens(mintAmount)}
                  />
                  :
                  <div className="collection-sold-out">
                    <h2>All PickAXE's have been <strong>sold out</strong>! <span className="emoji">🎉</span></h2>

                    You can buy from our holders on Opensea here: <a href={this.generateMarketplaceUrl()} target="_blank">{CollectionConfig.marketplaceConfig.name}</a>.
                  </div>
                }
              </>
              :
              <div className="collection-not-ready">
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>

                Loading collection data...
              </div>
            }
          </>
        : null}

        {!this.isWalletConnected() || !this.isSoldOut() ?
          <div className="no-wallet">
            {!this.isWalletConnected() ? <button className="primary" disabled={this.provider === undefined} onClick={() => this.connectWallet()}>Connect Wallet</button> : null}
            {!this.isWalletConnected() || this.state.isWhitelistMintEnabled }                
          </div>
          : null}
          
          <div className="extensions">
          As seen on...
          <svg>
          <a href="https://nftcalendar.io/event/pickaxe-dao/" target="_blank" rel="noreferrer">
          <svg className="fill-neutral-400 hover:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 385.04 314.05"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"></g></g> 
          <stop stop-color="#fff" offset="0"/>      
          <path d="M283.13,304.11c4-11.78,7.77-23.68,12.2-35.3,4.74-12.43,9.93-24.69,15.36-36.83,2.27-5.09,5.79-9.3,12.35-9.54,1.4-.05,2.92-2,4.06-3.29,2.28-2.64,4.2-5.59,6.56-8.14a3.68,3.68,0,0,1,3.47-.65,4,4,0,0,1,1.28,3.34,23.49,23.49,0,0,1-2,5.6c-5.19,11.63-9.24,23.57-10.15,36.38a32.05,32.05,0,0,0,.79,9.84c10.16-6,15.54-15.51,21.55-24.81-5.41-4.14-4.7-9.13-1.68-13.81a189.4,189.4,0,0,1,13.15-18c1.17-1.42,4.32-1.2,6.56-1.73.48,2.44,1.77,5.09,1.24,7.29-1,4-3,7.65-5.17,12.82,4.76-2.55,8.21-4.74,11.94-6.29,3-1.24,8-3.39,9.15-2.23,3.41,3.5-1,6.59-2.86,9.33-8.09,11.76-15.29,24-17.8,38.2a70.13,70.13,0,0,0-.49,16.83c.38,5.49,3.4,6.45,7.66,2.86,1.39-1.17,2.38-2.81,3.75-4,.6-.52,1.7-.45,2.58-.65.14.91.59,1.91.36,2.72-1,3.53-6.64,7.72-10.35,7.64-4.93-.11-6.66-3.51-7.84-7.67-2.57-9.11-1.13-18.06,2-26.47,3.39-9,8.17-17.44,12.36-26.12a20.51,20.51,0,0,0,1.81-4.53c-8.62,5.44-18.46,8.73-24,18.55-3.87,6.89-9.48,12.85-14.58,19-2.4,2.89-5.23,6.35-9.63,4.68-4.24-1.62-4.85-5.93-4.53-9.75.62-7.26,1.84-14.48,2.86-21.72a14.47,14.47,0,0,0,0-6.34c-1.85,2.61-3.66,5.25-5.56,7.82-2.69,3.64-4.37,8.35-10.24,8.49-1,0-2.38,2.59-3,4.2-5,13.78-9.84,27.6-14.68,41.43-1.76,5-3.06,10.23-5.13,15.12-.91,2.15-3.22,3.69-4.9,5.51-1.3-1.9-3.37-3.64-3.78-5.72a215.81,215.81,0,0,1-2.41-67.62,63.31,63.31,0,0,0,.65-12.23c-1.34,2-2.63,4-4,6q-13,18-26.15,36a5.12,5.12,0,0,1-1.32,1.48c-2.56,1.52-5.45,4.5-7.69,4.07-4.09-.77-2.92-5.25-3.08-8.47-.05-1,0-1.95,0-3.36a24.8,24.8,0,0,0-3,.67c-4.38,1.65-7.43-.14-8.61-4.19-1.43-4.89-2-10-3.32-16.58-2.29,9.84-4.3,18.49-6.29,27.14-.37,1.62-.41,3.38-1.1,4.85a26.73,26.73,0,0,1-3.18,4.35c-1.32-1.48-3.56-2.83-3.81-4.47-.75-5.07-.76-10.25-1-15.39-.07-1.28,0-2.56,0-4.75-1.35,1.23-2.12,1.9-2.87,2.59-3.27,3.05-6.21,6.59-9.87,9.06-7.69,5.18-15.94,1.56-17.54-7.58a31.53,31.53,0,0,1,5.95-24.58c3-4.19,7.22-5.34,10.35-3.36s3.56,5.88.92,10.69c-3.39,6.18-6.05,7.11-11.59,3.54-1.42,5.25-3.43,10.19-1.47,15.57,1.39,3.81,4.3,5.53,7.84,3.3,3.88-2.44,8.2-5.1,10.59-8.79,4.66-7.16,8.18-15.06,12-22.74,1.5-3,2.55-6.25,3.81-9.38l2.09.25c.07,1.66.47,3.38.17,5-1.54,8.32-3.29,16.61-4.89,24.92a7.52,7.52,0,0,0,.46,4.43c1.95-6.42,3.74-12.88,5.89-19.23a106.38,106.38,0,0,1,5-11.92c.45-1,1.91-1.44,2.91-2.14.69,1.06,1.91,2.1,2,3.19.17,3.48-.21,7-.17,10.47.07,6.15.21,12.3.5,18.43,0,1.17.94,2.29,2.16,5,5.39-6.7,9.78-12.67,14.7-18.16,7.19-8,14.64-15.79,22.24-23.41,1.59-1.6,4.29-2.09,7.1-2.24-16.41,13.83-28.9,29.75-33.76,52.3,1.68-1.35,2.42-1.71,2.84-2.31,12.17-17.48,24.56-34.81,36.3-52.58,3.79-5.74,5.73-12.7,8.73-19,4.34-9.14,8.86-18.2,13.35-27.27a7,7,0,0,1,2.07-2.78c2.06-1.36,4.32-2.4,6.5-3.57.29,2.59,1.62,5.66.69,7.68-3.61,7.84-7.27,15.81-12.13,22.89-8.52,12.39-13.22,25.91-15.55,40.62-3.67,23.24-2.89,46.33.9,69.4Zm65.33-70.43c5.78-.68,13.77-13.31,12.52-20.15Zm-160.85,2.47-1.14-.94c-1.53,1.87-3.08,3.73-4.52,5.68a14.87,14.87,0,0,0,1.55,1.52Zm124.82,2,1.29.87,6-9.17-1.15-.77Z"/>
		    	<path d="M154.9,255.31c-6.1,7.53-11.22,14.07-16.57,20.41-2.54,3-5.26,6.77-9.89,5.35-4.78-1.47-5-6.3-4.69-10.08.53-7.6,1.93-15.13,3-22.68.29-1.91.82-3.79.39-6.11-2.7,3.9-5.27,7.89-8.13,11.66-2.23,2.95-4.11,6.75-9.23,4.78-.72-.28-2.61,2-3.72,3.32-6,7.09-11.49,14.61-17.92,21.25-4.18,4.32-9.78,7.69-16.2,4.2-6.13-3.32-7-9.52-6.59-15.65.73-11.86,3.93-23.06,11.54-32.41,2.53-3.09,6.2-5.46,9.75-7.4,1.27-.69,5.12.44,5.42,1.46a20,20,0,0,1,.36,9c-.24,1.38-2.44,2.43-3.75,3.63l-.94-1,2.76-8.84L89,235c-2.5,1.89-5.45,3.4-7.42,5.73-9.26,11-13,23.86-11.94,38,.46,6.11,4.84,8.51,9.85,4.92a80.76,80.76,0,0,0,16.62-15.44c6.32-8.1,11.34-17.22,16.91-25.92,2.58-4,5.44-7.42,10.83-7.87,1.63-.13,3.33-1.94,4.6-3.34,2.33-2.59,4.23-5.57,6.59-8.13a3.74,3.74,0,0,1,3.47-.74,3.69,3.69,0,0,1,1.18,3.32,52.08,52.08,0,0,1-2.87,8c-5.47,12.63-9.59,25.58-9.23,39.55,0,1.46.93,2.9,1.43,4.36,1.26-.69,2.92-1.07,3.71-2.12q11.43-15.09,22.55-30.43c.77-1.06.62-2.85.73-4.32,1.76-23.56,7.44-46,19.81-66.35.43-.71.71-1.63,1.34-2.08,1.48-1.08,3.12-1.93,4.7-2.87.83,1.86,2.47,3.79,2.33,5.56a53.51,53.51,0,0,1-2.48,12.2c-4.9,14.85-9.21,30-15.39,44.3-5.7,13.21-7.7,26.41-5.72,40.38,1.28,9.06,2.7,18.11,4.6,27,.81,3.8,3.18,7.23,4.55,10.94.48,1.29.07,2.9.07,4.37-1.36-.64-3.59-1-4-1.95-2.43-6.7-5.17-13.41-6.47-20.36-1.77-9.46-2.35-19.13-3.45-28.71C155.64,260.79,155.32,258.56,154.9,255.31Zm7.57-29.16,1.75.51L181,176.94l-1.71-.58C169.12,191.42,164.71,208.42,162.47,226.15ZM114.25,249l1.52,1,6-9-1.26-.85Z"/>
		    	<path d="M42.42,35.5a5.55,5.55,0,0,0-5.22,4.35C-1.74,223.55.11,214.17,0,214.9a2.77,2.77,0,0,0,2.79,3.2h24A5.77,5.77,0,0,0,32,213.75l17.61-82.6c8.62,74.86,9.29,82.58,9.34,83.54a3.62,3.62,0,0,0,3.63,3.41H85.24a5.78,5.78,0,0,0,5.22-4.35L127.41,39a3.32,3.32,0,0,0-3.48-3.48H101.32a5.55,5.55,0,0,0-5.21,4.35L77.19,129,68.93,39a3.31,3.31,0,0,0-3.47-3.48Z"/>
		    	<path d="m114.2 213.8a9.74 9.74 0 0 1-0.22 1.09 3.44 3.44 0 0 0 3.69 3.26h25.8a5.79 5.79 0 0 0 5.24-4.37l12.67-60.3h27.64a6.09 6.09 0 0 0 5.51-4.41c3.86-19.29 4.51-21.88 4.62-22.52a2.94 2.94 0 0 0-3-3.5h-28.26l12.69-59.6h34.15a5.51 5.51 0 0 0 5.22-4.32l4.29-20.08a3.3 3.3 0 0 0-3.46-3.46h-64.41a5.55 5.55 0 0 0-5.22 4.35z"/>
		    	<path d="M210.62,0a5.54,5.54,0,0,0-5.2,4.32l-4.1,19.25c0,2.59,1.3,4.33,3.46,4.33h43c-35.85,169-39.15,184-39.45,185.5a2.76,2.76,0,0,0,2.82,3.43h26.44a5.75,5.75,0,0,0,5.2-4.34L282,27.9h43a5.52,5.52,0,0,0,5.18-4.33l4.11-20.11A3.28,3.28,0,0,0,330.85,0Z"/>
          </svg>
          </a>
          </svg>   
          </div>     
      </>
    );
  }

  private setError(error: any = null): void
  {
    let errorMessage = 'Unknown error...';

    if (null === error || typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object') {
      // Support any type of error from the Web3 Provider...
      if (error?.error?.message !== undefined) {
        errorMessage = error.error.message;
      } else if (error?.data?.message !== undefined) {
        errorMessage = error.data.message;
      } else if (error?.message !== undefined) {
        errorMessage = error.message;
      } else if (React.isValidElement(error)) {
        this.setState({errorMessage: error});
  
        return;
      }
    }

    this.setState({
      errorMessage: null === errorMessage ? null : errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
    });
  }

  private generateContractUrl(): string
  {
    return this.state.networkConfig.blockExplorer.generateContractUrl(CollectionConfig.contractAddress!);
  }

  private generateMarketplaceUrl(): string
  {
    return CollectionConfig.marketplaceConfig.generateCollectionUrl(CollectionConfig.marketplaceIdentifier, !this.isNotMainnet());
  }

  private async connectWallet(): Promise<void>
  {
    try {
      await this.provider.provider.request!({ method: 'eth_requestAccounts' });

      this.initWallet();
    } catch (e) {
      this.setError(e);
    }
  }

  private async initWallet(): Promise<void>
  {
    const walletAccounts = await this.provider.listAccounts();
    
    this.setState(defaultState);

    if (walletAccounts.length === 0) {
      return;
    }

    const network = await this.provider.getNetwork();
    let networkConfig: NetworkConfigInterface;

    if (network.chainId === CollectionConfig.mainnet.chainId) {
      networkConfig = CollectionConfig.mainnet;
    } else if (network.chainId === CollectionConfig.testnet.chainId) {
      networkConfig = CollectionConfig.testnet;
    } else {
      this.setError('Unsupported network!');

      return;
    }
    
    this.setState({
      userAddress: walletAccounts[0],
      network,
      networkConfig,
    });

    this.contract = new ethers.Contract(
      CollectionConfig.contractAddress!,
      ContractAbi,
      this.provider.getSigner(),
    ) as NftContractType;

    this.setState({
      maxSupply: (await this.contract.maxSupply()).toNumber(),
      totalSupply: (await this.contract.totalSupply()).toNumber(),
      maxMintAmountPerTx: (await this.contract.maxMintAmountPerTx()).toNumber(),
      tokenPrice: await this.contract.cost(),
      isPaused: await this.contract.paused(),
      isWhitelistMintEnabled: await this.contract.whitelistMintEnabled(),
      isUserInWhitelist: Whitelist.contains(this.state.userAddress ?? ''),
    });
  }

  private registerWalletEvents(browserProvider: ExternalProvider): void
  {
    // @ts-ignore
    browserProvider.on('accountsChanged', () => {
      this.initWallet();
    });

    // @ts-ignore
    browserProvider.on('chainChanged', () => {
      window.location.reload();
    });
  }
}

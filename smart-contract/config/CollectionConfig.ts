import CollectionConfigInterface from '../lib/CollectionConfigInterface';
import * as Networks from '../lib/Networks';
import * as Marketplaces from '../lib/Marketplaces';
import whitelistAddresses from './whitelist.json';

const CollectionConfig: CollectionConfigInterface = {
  testnet: Networks.polygonTestnet,
  mainnet: Networks.polygonMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'PickAXE',
  tokenName: 'PickAXE Miner',
  tokenSymbol: 'PAXE',
  hiddenMetadataUri: "ipfs://QmWFK6BgNgydBahQBrVrZc5ASX1nNtcw8pWqkmnrpsHwxx/hidden_metadata.json",
  maxSupply: 1000,
  whitelistSale: {
    price: 0.01,
    maxMintAmountPerTx: 10,
  },
  preSale: {
    price: 0.07,
    maxMintAmountPerTx: 2,
  },
  publicSale: {
    price: 0.015,
    maxMintAmountPerTx: 5,
  },
  contractAddress: "0x242251EC5149459b2160B1EE5fa0dC66407f9165",
  marketplaceIdentifier: 'PickAXE DAO Miners',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses: whitelistAddresses,
};

export default CollectionConfig;

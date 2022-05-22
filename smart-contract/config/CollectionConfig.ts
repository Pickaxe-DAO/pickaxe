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
  tokenName: 'PickAXE DAO Miners',
  tokenSymbol: 'PAXE',
  hiddenMetadataUri: "ipfs://QmWFK6BgNgydBahQBrVrZc5ASX1nNtcw8pWqkmnrpsHwxx/hidden_metadata.json",
  maxSupply: 1000,
  whitelistSale: {
    price: 31,
    maxMintAmountPerTx: 20,
  },
  preSale: {
    price: 31,
    maxMintAmountPerTx: 20,
  },
  publicSale: {
    price: 31,
    maxMintAmountPerTx: 50,
  },
  contractAddress: "0x8674e38d25ebcfE51Bb696AD8B6cf7CA31a7B7a9",
  marketplaceIdentifier: 'PickAXE DAO Miners',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses: whitelistAddresses,
};

export default CollectionConfig;

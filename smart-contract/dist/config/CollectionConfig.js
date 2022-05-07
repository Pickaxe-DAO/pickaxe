"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Networks = __importStar(require("../lib/Networks"));
const Marketplaces = __importStar(require("../lib/Marketplaces"));
const whitelist_json_1 = __importDefault(require("./whitelist.json"));
const CollectionConfig = {
    testnet: Networks.polygonTestnet,
    mainnet: Networks.polygonMainnet,
    // The contract name can be updated using the following command:
    // yarn rename-contract NEW_CONTRACT_NAME
    // Please DO NOT change it manually!
    contractName: 'PickAXE',
    tokenName: 'PickAXE',
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
    whitelistAddresses: whitelist_json_1.default,
};
exports.default = CollectionConfig;

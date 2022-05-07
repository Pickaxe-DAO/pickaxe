"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const CollectionConfig_1 = __importDefault(require("./CollectionConfig"));
// Update the following array if you change the constructor arguments...
const ContractArguments = [
    CollectionConfig_1.default.tokenName,
    CollectionConfig_1.default.tokenSymbol,
    ethers_1.utils.parseEther(CollectionConfig_1.default.whitelistSale.price.toString()),
    CollectionConfig_1.default.maxSupply,
    CollectionConfig_1.default.whitelistSale.maxMintAmountPerTx,
    CollectionConfig_1.default.hiddenMetadataUri,
];
exports.default = ContractArguments;

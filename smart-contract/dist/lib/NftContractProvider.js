"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const CollectionConfig_1 = __importDefault(require("./../config/CollectionConfig"));
class NftContractProvider {
    static async getContract() {
        // Check configuration
        if (null === CollectionConfig_1.default.contractAddress) {
            throw '\x1b[31merror\x1b[0m ' + 'Please add the contract address to the configuration before running this command.';
        }
        if (await hardhat_1.ethers.provider.getCode(CollectionConfig_1.default.contractAddress) === '0x') {
            throw '\x1b[31merror\x1b[0m ' + `Can't find a contract deployed to the target address: ${CollectionConfig_1.default.contractAddress}`;
        }
        return await hardhat_1.ethers.getContractAt(CollectionConfig_1.default.contractName, CollectionConfig_1.default.contractAddress);
    }
}
exports.default = NftContractProvider;
;

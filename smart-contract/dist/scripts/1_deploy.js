"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const CollectionConfig_1 = __importDefault(require("../config/CollectionConfig"));
const ContractArguments_1 = __importDefault(require("./../config/ContractArguments"));
async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');
    console.log('Deploying contract...');
    // We get the contract to deploy
    const Contract = await hardhat_1.ethers.getContractFactory(CollectionConfig_1.default.contractName);
    const contract = await Contract.deploy(...ContractArguments_1.default);
    await contract.deployed();
    console.log('Contract deployed to:', contract.address);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

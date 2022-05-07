"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const CollectionConfig_1 = __importDefault(require("./../config/CollectionConfig"));
const NftContractProvider_1 = __importDefault(require("../lib/NftContractProvider"));
async function main() {
    // Attach to deployed contract
    const contract = await NftContractProvider_1.default.getContract();
    // Update sale price (if needed)
    const preSalePrice = ethers_1.utils.parseEther(CollectionConfig_1.default.preSale.price.toString());
    if (!await (await contract.cost()).eq(preSalePrice)) {
        console.log(`Updating the token price to ${CollectionConfig_1.default.preSale.price} ${CollectionConfig_1.default.mainnet.symbol}...`);
        await (await contract.setCost(preSalePrice)).wait();
    }
    // Update max amount per TX (if needed)
    if (!await (await contract.maxMintAmountPerTx()).eq(CollectionConfig_1.default.preSale.maxMintAmountPerTx)) {
        console.log(`Updating the max mint amount per TX to ${CollectionConfig_1.default.preSale.maxMintAmountPerTx}...`);
        await (await contract.setMaxMintAmountPerTx(CollectionConfig_1.default.preSale.maxMintAmountPerTx)).wait();
    }
    // Unpause the contract (if needed)
    if (await contract.paused()) {
        console.log('Unpausing the contract...');
        await (await contract.setPaused(false)).wait();
    }
    console.log('Pre-sale is now open!');
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

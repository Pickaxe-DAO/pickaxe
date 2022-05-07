"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const merkletreejs_1 = require("merkletreejs");
const keccak256_1 = __importDefault(require("keccak256"));
const CollectionConfig_1 = __importDefault(require("./../config/CollectionConfig"));
const NftContractProvider_1 = __importDefault(require("../lib/NftContractProvider"));
async function main() {
    // Check configuration
    if (CollectionConfig_1.default.whitelistAddresses.length < 1) {
        throw '\x1b[31merror\x1b[0m ' + 'The whitelist is empty, please add some addresses to the configuration.';
    }
    // Build the Merkle Tree
    const leafNodes = CollectionConfig_1.default.whitelistAddresses.map(addr => (0, keccak256_1.default)(addr));
    const merkleTree = new merkletreejs_1.MerkleTree(leafNodes, keccak256_1.default, { sortPairs: true });
    const rootHash = '0x' + merkleTree.getRoot().toString('hex');
    // Attach to deployed contract
    const contract = await NftContractProvider_1.default.getContract();
    // Update sale price (if needed)
    const whitelistPrice = ethers_1.utils.parseEther(CollectionConfig_1.default.whitelistSale.price.toString());
    if (!await (await contract.cost()).eq(whitelistPrice)) {
        console.log(`Updating the token price to ${CollectionConfig_1.default.whitelistSale.price} ${CollectionConfig_1.default.mainnet.symbol}...`);
        await (await contract.setCost(whitelistPrice)).wait();
    }
    // Update max amount per TX (if needed)
    if (!await (await contract.maxMintAmountPerTx()).eq(CollectionConfig_1.default.whitelistSale.maxMintAmountPerTx)) {
        console.log(`Updating the max mint amount per TX to ${CollectionConfig_1.default.whitelistSale.maxMintAmountPerTx}...`);
        await (await contract.setMaxMintAmountPerTx(CollectionConfig_1.default.whitelistSale.maxMintAmountPerTx)).wait();
    }
    // Update root hash (if changed)
    if ((await contract.merkleRoot()) !== rootHash) {
        console.log(`Updating the root hash to: ${rootHash}`);
        await (await contract.setMerkleRoot(rootHash)).wait();
    }
    // Enable whitelist sale (if needed)
    if (!await contract.whitelistMintEnabled()) {
        console.log('Enabling whitelist sale...');
        await (await contract.setWhitelistMintEnabled(true)).wait();
    }
    console.log('Whitelist sale has been enabled!');
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

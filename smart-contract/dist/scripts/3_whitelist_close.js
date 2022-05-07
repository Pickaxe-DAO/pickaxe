"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NftContractProvider_1 = __importDefault(require("../lib/NftContractProvider"));
async function main() {
    // Attach to deployed contract
    const contract = await NftContractProvider_1.default.getContract();
    // Disable whitelist sale (if needed)
    if (await contract.whitelistMintEnabled()) {
        console.log('Disabling whitelist sale...');
        await (await contract.setWhitelistMintEnabled(false)).wait();
    }
    console.log('Whitelist sale has been disabled!');
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

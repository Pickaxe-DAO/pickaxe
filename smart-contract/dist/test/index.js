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
const chai_1 = __importStar(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const ethers_1 = require("ethers");
const hardhat_1 = require("hardhat");
const merkletreejs_1 = require("merkletreejs");
const keccak256_1 = __importDefault(require("keccak256"));
const CollectionConfig_1 = __importDefault(require("./../config/CollectionConfig"));
const ContractArguments_1 = __importDefault(require("../config/ContractArguments"));
chai_1.default.use(chai_as_promised_1.default);
var SaleType;
(function (SaleType) {
    SaleType[SaleType["WHITELIST"] = CollectionConfig_1.default.whitelistSale.price] = "WHITELIST";
    SaleType[SaleType["PRE_SALE"] = CollectionConfig_1.default.preSale.price] = "PRE_SALE";
    SaleType[SaleType["PUBLIC_SALE"] = CollectionConfig_1.default.publicSale.price] = "PUBLIC_SALE";
})(SaleType || (SaleType = {}));
;
const whitelistAddresses = [
    // Hardhat test addresses...
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
    "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
    "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
    "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
    "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
    "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
    "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
    "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
];
function getPrice(saleType, mintAmount) {
    return ethers_1.utils.parseEther(saleType.toString()).mul(mintAmount);
}
describe(CollectionConfig_1.default.contractName, function () {
    let owner;
    let whitelistedUser;
    let holder;
    let externalUser;
    let contract;
    before(async function () {
        [owner, whitelistedUser, holder, externalUser] = await hardhat_1.ethers.getSigners();
    });
    it('Contract deployment', async function () {
        const Contract = await hardhat_1.ethers.getContractFactory(CollectionConfig_1.default.contractName);
        contract = await Contract.deploy(...ContractArguments_1.default);
        await contract.deployed();
    });
    it('Check initial data', async function () {
        (0, chai_1.expect)(await contract.name()).to.equal(CollectionConfig_1.default.tokenName);
        (0, chai_1.expect)(await contract.symbol()).to.equal(CollectionConfig_1.default.tokenSymbol);
        (0, chai_1.expect)(await contract.cost()).to.equal(getPrice(SaleType.WHITELIST, 1));
        (0, chai_1.expect)(await contract.maxSupply()).to.equal(CollectionConfig_1.default.maxSupply);
        (0, chai_1.expect)(await contract.maxMintAmountPerTx()).to.equal(CollectionConfig_1.default.whitelistSale.maxMintAmountPerTx);
        (0, chai_1.expect)(await contract.hiddenMetadataUri()).to.equal(CollectionConfig_1.default.hiddenMetadataUri);
        (0, chai_1.expect)(await contract.paused()).to.equal(true);
        (0, chai_1.expect)(await contract.whitelistMintEnabled()).to.equal(false);
        (0, chai_1.expect)(await contract.revealed()).to.equal(false);
        await (0, chai_1.expect)(contract.tokenURI(1)).to.be.revertedWith('ERC721Metadata: URI query for nonexistent token');
    });
    it('Before any sale', async function () {
        // Nobody should be able to mint from a paused contract
        await (0, chai_1.expect)(contract.connect(whitelistedUser).mint(1, { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('The contract is paused!');
        await (0, chai_1.expect)(contract.connect(whitelistedUser).whitelistMint(1, [], { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('The whitelist sale is not enabled!');
        await (0, chai_1.expect)(contract.connect(holder).mint(1, { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('The contract is paused!');
        await (0, chai_1.expect)(contract.connect(holder).whitelistMint(1, [], { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('The whitelist sale is not enabled!');
        await (0, chai_1.expect)(contract.connect(owner).mint(1, { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('The contract is paused!');
        await (0, chai_1.expect)(contract.connect(owner).whitelistMint(1, [], { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('The whitelist sale is not enabled!');
        // The owner should always be able to run mintForAddress
        await (await contract.mintForAddress(1, await owner.getAddress())).wait();
        await (await contract.mintForAddress(1, await whitelistedUser.getAddress())).wait();
        // But not over the maxMintAmountPerTx
        await (0, chai_1.expect)(contract.mintForAddress(await (await contract.maxMintAmountPerTx()).add(1), await holder.getAddress())).to.be.revertedWith('Invalid mint amount!');
        // Check balances
        (0, chai_1.expect)(await contract.balanceOf(await owner.getAddress())).to.equal(1);
        (0, chai_1.expect)(await contract.balanceOf(await whitelistedUser.getAddress())).to.equal(1);
        (0, chai_1.expect)(await contract.balanceOf(await holder.getAddress())).to.equal(0);
        (0, chai_1.expect)(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
    });
    it('Whitelist sale', async function () {
        // Build MerkleTree
        const leafNodes = whitelistAddresses.map(addr => (0, keccak256_1.default)(addr));
        const merkleTree = new merkletreejs_1.MerkleTree(leafNodes, keccak256_1.default, { sortPairs: true });
        const rootHash = merkleTree.getRoot();
        // Update the root hash
        await (await contract.setMerkleRoot('0x' + rootHash.toString('hex'))).wait();
        await contract.setWhitelistMintEnabled(true);
        await contract.connect(whitelistedUser).whitelistMint(1, merkleTree.getHexProof((0, keccak256_1.default)(await whitelistedUser.getAddress())), { value: getPrice(SaleType.WHITELIST, 1) });
        // Trying to mint twice
        await (0, chai_1.expect)(contract.connect(whitelistedUser).whitelistMint(1, merkleTree.getHexProof((0, keccak256_1.default)(await whitelistedUser.getAddress())), { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('Address already claimed!');
        // Sending an invalid mint amount
        await (0, chai_1.expect)(contract.connect(whitelistedUser).whitelistMint(await (await contract.maxMintAmountPerTx()).add(1), merkleTree.getHexProof((0, keccak256_1.default)(await whitelistedUser.getAddress())), { value: getPrice(SaleType.WHITELIST, await (await contract.maxMintAmountPerTx()).add(1).toNumber()) })).to.be.revertedWith('Invalid mint amount!');
        // Sending insufficient funds
        await (0, chai_1.expect)(contract.connect(whitelistedUser).whitelistMint(1, merkleTree.getHexProof((0, keccak256_1.default)(await whitelistedUser.getAddress())), { value: getPrice(SaleType.WHITELIST, 1).sub(1) })).to.be.rejectedWith(Error, 'insufficient funds for intrinsic transaction cost');
        // Pretending to be someone else
        await (0, chai_1.expect)(contract.connect(holder).whitelistMint(1, merkleTree.getHexProof((0, keccak256_1.default)(await whitelistedUser.getAddress())), { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('Invalid proof!');
        // Sending an invalid proof
        await (0, chai_1.expect)(contract.connect(holder).whitelistMint(1, merkleTree.getHexProof((0, keccak256_1.default)(await holder.getAddress())), { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('Invalid proof!');
        // Sending no proof at all
        await (0, chai_1.expect)(contract.connect(holder).whitelistMint(1, [], { value: getPrice(SaleType.WHITELIST, 1) })).to.be.revertedWith('Invalid proof!');
        // Pause whitelist sale
        await contract.setWhitelistMintEnabled(false);
        await contract.setCost(ethers_1.utils.parseEther(CollectionConfig_1.default.preSale.price.toString()));
        // Check balances
        (0, chai_1.expect)(await contract.balanceOf(await owner.getAddress())).to.equal(1);
        (0, chai_1.expect)(await contract.balanceOf(await whitelistedUser.getAddress())).to.equal(2);
        (0, chai_1.expect)(await contract.balanceOf(await holder.getAddress())).to.equal(0);
        (0, chai_1.expect)(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
    });
    it('Pre-sale (same as public sale)', async function () {
        await contract.setMaxMintAmountPerTx(CollectionConfig_1.default.preSale.maxMintAmountPerTx);
        await contract.setPaused(false);
        await contract.connect(holder).mint(2, { value: getPrice(SaleType.PRE_SALE, 2) });
        await contract.connect(whitelistedUser).mint(1, { value: getPrice(SaleType.PRE_SALE, 1) });
        // Sending insufficient funds
        await (0, chai_1.expect)(contract.connect(holder).mint(1, { value: getPrice(SaleType.PRE_SALE, 1).sub(1) })).to.be.rejectedWith(Error, 'insufficient funds for intrinsic transaction cost');
        // Sending an invalid mint amount
        await (0, chai_1.expect)(contract.connect(whitelistedUser).mint(await (await contract.maxMintAmountPerTx()).add(1), { value: getPrice(SaleType.PRE_SALE, await (await contract.maxMintAmountPerTx()).add(1).toNumber()) })).to.be.revertedWith('Invalid mint amount!');
        // Sending a whitelist mint transaction
        await (0, chai_1.expect)(contract.connect(whitelistedUser).whitelistMint(1, [], { value: getPrice(SaleType.WHITELIST, 1) })).to.be.rejectedWith(Error, 'insufficient funds for intrinsic transaction cost');
        // Pause pre-sale
        await contract.setPaused(true);
        await contract.setCost(ethers_1.utils.parseEther(CollectionConfig_1.default.publicSale.price.toString()));
    });
    it('Owner only functions', async function () {
        await (0, chai_1.expect)(contract.connect(externalUser).mintForAddress(1, await externalUser.getAddress())).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setRevealed(false)).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setCost(ethers_1.utils.parseEther('0.0000001'))).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setMaxMintAmountPerTx(99999)).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setHiddenMetadataUri('INVALID_URI')).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setUriPrefix('INVALID_PREFIX')).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setUriSuffix('INVALID_SUFFIX')).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setPaused(false)).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setMerkleRoot('0x0000000000000000000000000000000000000000000000000000000000000000')).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).setWhitelistMintEnabled(false)).to.be.revertedWith('Ownable: caller is not the owner');
        await (0, chai_1.expect)(contract.connect(externalUser).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it('Wallet of owner', async function () {
        (0, chai_1.expect)(await contract.walletOfOwner(await owner.getAddress())).deep.equal([
            ethers_1.BigNumber.from(1),
        ]);
        (0, chai_1.expect)(await contract.walletOfOwner(await whitelistedUser.getAddress())).deep.equal([
            ethers_1.BigNumber.from(2),
            ethers_1.BigNumber.from(3),
            ethers_1.BigNumber.from(6),
        ]);
        (0, chai_1.expect)(await contract.walletOfOwner(await holder.getAddress())).deep.equal([
            ethers_1.BigNumber.from(4),
            ethers_1.BigNumber.from(5),
        ]);
        (0, chai_1.expect)(await contract.walletOfOwner(await externalUser.getAddress())).deep.equal([]);
    });
    it('Supply checks (long)', async function () {
        if (process.env.EXTENDED_TESTS === undefined) {
            this.skip();
        }
        const alreadyMinted = 6;
        const maxMintAmountPerTx = 1000;
        const iterations = Math.floor((CollectionConfig_1.default.maxSupply - alreadyMinted) / maxMintAmountPerTx);
        const expectedTotalSupply = iterations * maxMintAmountPerTx + alreadyMinted;
        const lastMintAmount = CollectionConfig_1.default.maxSupply - expectedTotalSupply;
        (0, chai_1.expect)(await contract.totalSupply()).to.equal(alreadyMinted);
        await contract.setPaused(false);
        await contract.setMaxMintAmountPerTx(maxMintAmountPerTx);
        await Promise.all([...Array(iterations).keys()].map(async () => await contract.connect(whitelistedUser).mint(maxMintAmountPerTx, { value: getPrice(SaleType.PUBLIC_SALE, maxMintAmountPerTx) })));
        // Try to mint over max supply (before sold-out)
        await (0, chai_1.expect)(contract.connect(holder).mint(lastMintAmount + 1, { value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount + 1) })).to.be.revertedWith('Max supply exceeded!');
        await (0, chai_1.expect)(contract.connect(holder).mint(lastMintAmount + 2, { value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount + 2) })).to.be.revertedWith('Max supply exceeded!');
        (0, chai_1.expect)(await contract.totalSupply()).to.equal(expectedTotalSupply);
        // Mint last tokens with owner address and test walletOfOwner(...)
        await contract.connect(owner).mint(lastMintAmount, { value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount) });
        const expectedWalletOfOwner = [
            ethers_1.BigNumber.from(1),
        ];
        for (const i of [...Array(lastMintAmount).keys()].reverse()) {
            expectedWalletOfOwner.push(ethers_1.BigNumber.from(CollectionConfig_1.default.maxSupply - i));
        }
        (0, chai_1.expect)(await contract.walletOfOwner(await owner.getAddress(), {
            // Set gas limit to the maximum value since this function should be used off-chain only and it would fail otherwise...
            gasLimit: ethers_1.BigNumber.from('0xffffffffffffffff'),
        })).deep.equal(expectedWalletOfOwner);
        // Try to mint over max supply (after sold-out)
        await (0, chai_1.expect)(contract.connect(whitelistedUser).mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1) })).to.be.revertedWith('Max supply exceeded!');
        (0, chai_1.expect)(await contract.totalSupply()).to.equal(CollectionConfig_1.default.maxSupply);
    });
    it('Token URI generation', async function () {
        const uriPrefix = 'ipfs://__COLLECTION_CID__/';
        const uriSuffix = '.json';
        const totalSupply = await contract.totalSupply();
        (0, chai_1.expect)(await contract.tokenURI(1)).to.equal(CollectionConfig_1.default.hiddenMetadataUri);
        // Reveal collection
        await contract.setUriPrefix(uriPrefix);
        await contract.setRevealed(true);
        // ERC721A uses token IDs starting from 0 internally...
        await (0, chai_1.expect)(contract.tokenURI(0)).to.be.revertedWith('ERC721Metadata: URI query for nonexistent token');
        // Testing first and last minted tokens
        (0, chai_1.expect)(await contract.tokenURI(1)).to.equal(`${uriPrefix}1${uriSuffix}`);
        (0, chai_1.expect)(await contract.tokenURI(totalSupply)).to.equal(`${uriPrefix}${totalSupply}${uriSuffix}`);
    });
});

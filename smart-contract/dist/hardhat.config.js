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
const fs_1 = __importDefault(require("fs"));
const dotenv = __importStar(require("dotenv"));
const config_1 = require("hardhat/config");
const merkletreejs_1 = require("merkletreejs");
const keccak256_1 = __importDefault(require("keccak256"));
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("solidity-coverage");
const CollectionConfig_1 = __importDefault(require("./config/CollectionConfig"));
dotenv.config();
/*
 * If you have issues with stuck transactions or you simply want to invest in
 * higher gas fees in order to make sure your transactions will run smoother
 * and faster, then you can update the followind value.
 * This value is used by default in any network defined in this project, but
 * please make sure to add it manually if you define any custom network.
 *
 * Example:
 * Setting the value to "1.1" will raise the gas values by 10% compared to the
 * estimated value.
 */
const DEFAULT_GAS_MULTIPLIER = 1;
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
(0, config_1.task)('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        console.log(account.address);
    }
});
(0, config_1.task)('generate-root-hash', 'Generates and prints out the root hash for the current whitelist', async () => {
    // Check configuration
    if (CollectionConfig_1.default.whitelistAddresses.length < 1) {
        throw 'The whitelist is empty, please add some addresses to the configuration.';
    }
    // Build the Merkle Tree
    const leafNodes = CollectionConfig_1.default.whitelistAddresses.map(addr => (0, keccak256_1.default)(addr));
    const merkleTree = new merkletreejs_1.MerkleTree(leafNodes, keccak256_1.default, { sortPairs: true });
    const rootHash = '0x' + merkleTree.getRoot().toString('hex');
    console.log('The Merkle Tree root hash for the current whitelist is: ' + rootHash);
});
(0, config_1.task)('generate-proof', 'Generates and prints out the whitelist proof for the given address (compatible with block explorers such as Etherscan)', async (taskArgs) => {
    // Check configuration
    if (CollectionConfig_1.default.whitelistAddresses.length < 1) {
        throw 'The whitelist is empty, please add some addresses to the configuration.';
    }
    // Build the Merkle Tree
    const leafNodes = CollectionConfig_1.default.whitelistAddresses.map(addr => (0, keccak256_1.default)(addr));
    const merkleTree = new merkletreejs_1.MerkleTree(leafNodes, keccak256_1.default, { sortPairs: true });
    const proof = merkleTree.getHexProof((0, keccak256_1.default)(taskArgs.address)).toString().replace(/'/g, '').replace(/ /g, '');
    console.log('The whitelist proof for the given address is: ' + proof);
})
    .addPositionalParam('address', 'The public address');
(0, config_1.task)('rename-contract', 'Renames the smart contract replacing all occurrences in source files', async (taskArgs, hre) => {
    // Validate new name
    if (!/^([A-Z][A-Za-z0-9]+)$/.test(taskArgs.newName)) {
        throw 'The contract name must be in PascalCase: https://en.wikipedia.org/wiki/Camel_case#Variations_and_synonyms';
    }
    const oldContractFile = `${__dirname}/contracts/${CollectionConfig_1.default.contractName}.sol`;
    const newContractFile = `${__dirname}/contracts/${taskArgs.newName}.sol`;
    if (!fs_1.default.existsSync(oldContractFile)) {
        throw `Contract file not found: "${oldContractFile}" (did you change the configuration manually?)`;
    }
    if (fs_1.default.existsSync(newContractFile)) {
        throw `A file with that name already exists: "${oldContractFile}"`;
    }
    // Replace names in source files
    replaceInFile(__dirname + '/../minting-dapp/src/scripts/lib/NftContractType.ts', CollectionConfig_1.default.contractName, taskArgs.newName);
    replaceInFile(__dirname + '/config/CollectionConfig.ts', CollectionConfig_1.default.contractName, taskArgs.newName);
    replaceInFile(__dirname + '/lib/NftContractProvider.ts', CollectionConfig_1.default.contractName, taskArgs.newName);
    replaceInFile(oldContractFile, CollectionConfig_1.default.contractName, taskArgs.newName);
    // Rename the contract file
    fs_1.default.renameSync(oldContractFile, newContractFile);
    console.log(`Contract renamed successfully from "${CollectionConfig_1.default.contractName}" to "${taskArgs.newName}"!`);
    // Rebuilding types
    await hre.run('typechain');
})
    .addPositionalParam('newName', 'The new name');
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config = {
    solidity: {
        version: '0.8.9',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        truffle: {
            url: 'http://localhost:24012/rpc',
            timeout: 60000,
            gasMultiplier: DEFAULT_GAS_MULTIPLIER,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD',
        coinmarketcap: process.env.GAS_REPORTER_COIN_MARKET_CAP_API_KEY,
    },
    etherscan: {
        apiKey: {
            // Ethereum
            rinkeby: process.env.BLOCK_EXPLORER_API_KEY,
            mainnet: process.env.BLOCK_EXPLORER_API_KEY,
            // Polygon
            polygon: process.env.BLOCK_EXPLORER_API_KEY,
            polygonMumbai: process.env.BLOCK_EXPLORER_API_KEY,
        },
    },
};
// Setup "testnet" network
if (process.env.NETWORK_TESTNET_URL !== undefined) {
    config.networks.testnet = {
        url: process.env.NETWORK_TESTNET_URL,
        accounts: [process.env.NETWORK_TESTNET_PRIVATE_KEY],
        gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    };
}
// Setup "mainnet" network
if (process.env.NETWORK_MAINNET_URL !== undefined) {
    config.networks.mainnet = {
        url: process.env.NETWORK_MAINNET_URL,
        accounts: [process.env.NETWORK_MAINNET_PRIVATE_KEY],
        gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    };
}
exports.default = config;
/**
 * Replaces all occurrences of a string in the given file.
 */
function replaceInFile(file, search, replace) {
    const fileContent = fs_1.default.readFileSync(file, 'utf8').replace(new RegExp(search, 'g'), replace);
    fs_1.default.writeFileSync(file, fileContent, 'utf8');
}

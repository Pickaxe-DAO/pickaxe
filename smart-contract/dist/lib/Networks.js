"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polygonMainnet = exports.polygonTestnet = exports.ethereumMainnet = exports.ethereumTestnet = exports.hardhatLocal = void 0;
/*
 * Local networks
 */
exports.hardhatLocal = {
    chainId: 31337,
    symbol: 'ETH (test)',
    blockExplorer: {
        name: 'Block explorer (not available for local chains)',
        generateContractUrl: (contractAddress) => `#`,
    },
};
/*
 * Ethereum
 */
exports.ethereumTestnet = {
    chainId: 4,
    symbol: 'ETH (test)',
    blockExplorer: {
        name: 'Etherscan (Rinkeby)',
        generateContractUrl: (contractAddress) => `https://rinkeby.etherscan.io/address/${contractAddress}`,
    },
};
exports.ethereumMainnet = {
    chainId: 1,
    symbol: 'ETH',
    blockExplorer: {
        name: 'Etherscan',
        generateContractUrl: (contractAddress) => `https://etherscan.io/address/${contractAddress}`,
    },
};
/*
 * Polygon
 */
exports.polygonTestnet = {
    chainId: 80001,
    symbol: 'ETH',
    blockExplorer: {
        name: 'Polygonscan (Mumbai)',
        generateContractUrl: (contractAddress) => `https://mumbai.polygonscan.com/address/${contractAddress}`,
    },
};
exports.polygonMainnet = {
    chainId: 137,
    symbol: 'MATIC',
    blockExplorer: {
        name: 'Polygonscan',
        generateContractUrl: (contractAddress) => `https://polygonscan.com/address/${contractAddress}`,
    },
};

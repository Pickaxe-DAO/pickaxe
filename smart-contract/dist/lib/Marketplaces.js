"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openSea = void 0;
exports.openSea = {
    name: 'OpenSea',
    generateCollectionUrl: (marketplaceIdentifier, isMainnet) => 'https://' + (isMainnet ? 'www' : 'testnets') + '.opensea.io/collection/' + marketplaceIdentifier,
};

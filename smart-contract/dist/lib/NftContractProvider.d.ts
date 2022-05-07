import { PickAXE as ContractType } from '../typechain/index';
export default class NftContractProvider {
    static getContract(): Promise<ContractType>;
}
export declare type NftContractType = ContractType;

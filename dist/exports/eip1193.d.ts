import { AccountWallet, AztecAddress, Fr, type CompleteAddress, type NodeInfo, type PXE } from "@aztec/aztec.js";
import { TypedEip1193Provider } from "src/types.js";
import { TxHash } from "@aztec/circuit-types";
export declare class AztecEip1193Account extends AccountWallet {
    readonly eip1193Provider: TypedEip1193Provider;
    constructor(completeAddress: CompleteAddress, eip1193Provider: TypedEip1193Provider, pxe: PXE, nodeInfo: NodeInfo);
    experimental_createSecretHash(contractAddress: string | AztecAddress): Promise<Fr>;
    experimental_redeemShield(token: AztecAddress | string, amount: Fr | string | bigint, secretHash: Fr | string | bigint, txHash: TxHash | string): Promise<import("@aztec/aztec.js").SentTx>;
}
//# sourceMappingURL=eip1193.d.ts.map
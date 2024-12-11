import { AccountWallet, AztecAddress, CompleteAddress, Fr, TxExecutionRequest, TxHash, type NodeInfo, type PXE } from "@aztec/aztec.js";
import type { ExecutionRequestInit } from "@aztec/aztec.js/entrypoint";
import type { PrivateExecutionResult } from "@aztec/circuit-types";
import type { Eip1193Provider } from "../types.js";
export declare class Eip1193Account extends AccountWallet {
    #private;
    constructor(completeAddress: CompleteAddress, eip1193Provider: Eip1193Provider, pxe: PXE, nodeInfo: NodeInfo);
    experimental_createSecretHash(contractAddress: string | AztecAddress): Promise<Fr>;
    experimental_redeemShield(token: AztecAddress | string, amount: Fr | string | bigint, secretHash: Fr | string | bigint, txHash: TxHash | string): Promise<import("@aztec/aztec.js").SentTx>;
    sendTx(tx: any): Promise<import("@aztec/foundation/buffer").Buffer32>;
    proveTx(txRequest: TxExecutionRequest, privateExecutionResult: PrivateExecutionResult): Promise<any>;
    simulateTx(txRequest: TxExecutionRequest, simulatePublic: boolean, msgSender: AztecAddress, skipTxValidation: boolean): Promise<any>;
    createTxExecutionRequest(executions: ExecutionRequestInit): Promise<any>;
}
//# sourceMappingURL=eip1193.d.ts.map
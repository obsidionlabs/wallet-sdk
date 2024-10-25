export class Eip1193Account extends AccountWallet {
    /**
     * @param {CompleteAddress} completeAddress
     * @param {Eip1193Provider} eip1193Provider
     * @param {PXE} pxe
     * @param {NodeInfo} nodeInfo
     */
    constructor(completeAddress: CompleteAddress, eip1193Provider: Eip1193Provider, pxe: PXE, nodeInfo: NodeInfo);
    /**
     * @param {string | AztecAddress} contractAddress
     */
    experimental_createSecretHash(contractAddress: string | AztecAddress): Promise<Fr>;
    /**
     * @param {AztecAddress | string} token
     * @param {Fr | string | bigint} amount
     * @param {Fr | string | bigint} secretHash
     * @param {TxHash | string} txHash
     */
    experimental_redeemShield(token: AztecAddress | string, amount: Fr | string | bigint, secretHash: Fr | string | bigint, txHash: TxHash | string): Promise<import("@aztec/aztec.js").SentTx>;
    /**
     * @param {any} tx
     * @override
     */
    override sendTx(tx: any): Promise<import("@aztec/foundation/buffer").Buffer32>;
    /**
     * @param {TxExecutionRequest} txRequest
     * @param {PrivateExecutionResult} privateExecutionResult
     * @override
     */
    override proveTx(txRequest: TxExecutionRequest, privateExecutionResult: PrivateExecutionResult): Promise<any>;
    /**
     * @param {TxExecutionRequest} txRequest
     * @param {boolean} simulatePublic
     * @param {AztecAddress} [msgSender]
     * @param {boolean} [skipTxValidation]
     * @override
     */
    override simulateTx(txRequest: TxExecutionRequest, simulatePublic: boolean, msgSender?: AztecAddress | undefined, skipTxValidation?: boolean | undefined): Promise<any>;
    /**
     * @param {import("@aztec/aztec.js/entrypoint").ExecutionRequestInit} executions
     * @override
     */
    override createTxExecutionRequest(executions: import("@aztec/aztec.js/entrypoint").ExecutionRequestInit): Promise<any>;
    #private;
}
import { AccountWallet } from "@aztec/aztec.js";
import type { AztecAddress } from "@aztec/aztec.js";
import { Fr } from "@aztec/aztec.js";
import type { TxHash } from "@aztec/aztec.js";
import type { TxExecutionRequest } from "@aztec/aztec.js";
import type { PrivateExecutionResult } from "@aztec/circuit-types";
import type { CompleteAddress } from "@aztec/aztec.js";
import type { Eip1193Provider } from "../types.js";
import type { PXE } from "@aztec/aztec.js";
import type { NodeInfo } from "@aztec/aztec.js";
//# sourceMappingURL=eip1193.d.ts.map
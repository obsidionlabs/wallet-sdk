var _Eip1193Account_eip1193Provider, _Eip1193AccountInterface_completeAddress, _Eip1193AccountInterface_nodeInfo, _Eip1193AccountInterface_eip1193Provider;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
/** @import { CompleteAddress, PXE, TxExecutionRequest, NodeInfo, AztecAddress, TxHash } from "@aztec/aztec.js" */
/** @import { PrivateExecutionResult } from "@aztec/circuit-types" */
/** @import { AccountInterface } from "@aztec/aztec.js/account" */
/** @import { TypedEip1193Provider, Eip1193Provider } from "../types.js" */
import { AccountWallet, AuthWitness, Fr } from "@aztec/aztec.js";
import { serde } from "../serde.js";
// This is a terrible hack. More info here https://discord.com/channels/1144692727120937080/1215729116716728410/1215729116716728410
export class Eip1193Account extends AccountWallet {
    /**
     * @param {CompleteAddress} completeAddress
     * @param {Eip1193Provider} eip1193Provider
     * @param {PXE} pxe
     * @param {NodeInfo} nodeInfo
     */
    constructor(completeAddress, eip1193Provider, pxe, nodeInfo) {
        const typedEip1193Provider = /** @type {TypedEip1193Provider} */ (eip1193Provider);
        const account = new Eip1193AccountInterface(completeAddress, typedEip1193Provider, nodeInfo);
        super(pxe, account);
        /** @readonly @type {TypedEip1193Provider} */
        _Eip1193Account_eip1193Provider.set(this, void 0);
        __classPrivateFieldSet(this, _Eip1193Account_eip1193Provider, typedEip1193Provider, "f");
    }
    /**
     * @param {string | AztecAddress} contractAddress
     */
    async experimental_createSecretHash(contractAddress) {
        const { Fr } = await import("@aztec/aztec.js");
        const secretHash = await __classPrivateFieldGet(this, _Eip1193Account_eip1193Provider, "f").request({
            method: "aztec_experimental_createSecretHash",
            params: [
                {
                    from: this.account.getAddress().toString(),
                    contract: contractAddress.toString(),
                },
            ],
        });
        return new Fr(BigInt(secretHash));
    }
    /**
     * @param {AztecAddress | string} token
     * @param {Fr | string | bigint} amount
     * @param {Fr | string | bigint} secretHash
     * @param {TxHash | string} txHash
     */
    async experimental_redeemShield(token, amount, secretHash, txHash) {
        const { SentTx, TxHash } = await import("@aztec/aztec.js");
        const redeemTxHash = __classPrivateFieldGet(this, _Eip1193Account_eip1193Provider, "f")
            .request({
            method: "aztec_experimental_tokenRedeemShield",
            params: [
                {
                    from: this.account.getAddress().toString(),
                    token: token.toString(),
                    amount: amount.toString(),
                    secretHash: secretHash.toString(),
                    txHash: txHash.toString(),
                },
            ],
        })
            .then((txHash) => TxHash.fromString(txHash));
        return new SentTx(this.pxe, redeemTxHash);
    }
    /**
     * @param {any} tx
     * @override
     */
    async sendTx(tx) {
        const { TxHash } = await import("@aztec/aztec.js");
        const serializedExecs = await Promise.all(
        /** @type {import('@aztec/aztec.js/entrypoint').ExecutionRequestInit} */ (tx.executions).calls.map((e) => serde.FunctionCall.serialize(e)));
        const result = await __classPrivateFieldGet(this, _Eip1193Account_eip1193Provider, "f").request({
            method: "aztec_sendTransaction",
            params: [
                {
                    from: this.account.getAddress().toString(),
                    calls: serializedExecs,
                },
            ],
        });
        return TxHash.fromString(result);
    }
    /**
     * @param {TxExecutionRequest} txRequest
     * @param {PrivateExecutionResult} privateExecutionResult
     * @override
     */
    async proveTx(txRequest, privateExecutionResult) {
        // forward data to `this.sendTx`
        return /** @type {any} */ ({
            privateExecutionResult,
            ...txRequest,
            toTx() {
                return this;
            },
        });
    }
    /**
     * @param {TxExecutionRequest} txRequest
     * @param {boolean} simulatePublic
     * @param {AztecAddress} [msgSender]
     * @param {boolean} [skipTxValidation]
     * @override
     */
    async simulateTx(txRequest, simulatePublic, msgSender, skipTxValidation) {
        return /** @type {any} */ ({
            simulatePublic,
            msgSender,
            skipTxValidation,
            ...txRequest,
        });
    }
    /**
     * @param {import("@aztec/aztec.js/entrypoint").ExecutionRequestInit} executions
     * @override
     */
    async createTxExecutionRequest(executions) {
        // forward data to `this.simulateTx`
        return /** @type {any} */ ({ executions });
    }
}
_Eip1193Account_eip1193Provider = new WeakMap();
/**
 * @implements {AccountInterface}
 */
class Eip1193AccountInterface {
    /**
     * @param {CompleteAddress} address
     * @param {TypedEip1193Provider} rpc
     * @param {NodeInfo} nodeInfo
     */
    constructor(address, rpc, nodeInfo) {
        /** @readonly @type {CompleteAddress} */
        _Eip1193AccountInterface_completeAddress.set(this, void 0);
        /** @readonly @type {NodeInfo} */
        _Eip1193AccountInterface_nodeInfo.set(this, void 0);
        /** @readonly @type {TypedEip1193Provider} */
        _Eip1193AccountInterface_eip1193Provider.set(this, void 0);
        __classPrivateFieldSet(this, _Eip1193AccountInterface_completeAddress, address, "f");
        __classPrivateFieldSet(this, _Eip1193AccountInterface_eip1193Provider, rpc, "f");
        __classPrivateFieldSet(this, _Eip1193AccountInterface_nodeInfo, nodeInfo, "f");
    }
    getCompleteAddress() {
        return __classPrivateFieldGet(this, _Eip1193AccountInterface_completeAddress, "f");
    }
    /**
     *  @param {Fr} messageHash
     */
    async createAuthWit(messageHash) {
        await __classPrivateFieldGet(this, _Eip1193AccountInterface_eip1193Provider, "f").request({
            method: "aztec_createAuthWitness",
            params: [
                {
                    from: this.getAddress().toString(),
                    messageHash: messageHash.toString(),
                },
            ],
        });
        return new AuthWitness(Fr.random(), []);
    }
    /**
     * @returns {Promise<TxExecutionRequest>}
     */
    async createTxExecutionRequest() {
        throw new Error("use account.sendTx");
    }
    getAddress() {
        return __classPrivateFieldGet(this, _Eip1193AccountInterface_completeAddress, "f").address;
    }
    getChainId() {
        return new Fr(__classPrivateFieldGet(this, _Eip1193AccountInterface_nodeInfo, "f").l1ChainId);
    }
    getVersion() {
        return new Fr(__classPrivateFieldGet(this, _Eip1193AccountInterface_nodeInfo, "f").protocolVersion);
    }
}
_Eip1193AccountInterface_completeAddress = new WeakMap(), _Eip1193AccountInterface_nodeInfo = new WeakMap(), _Eip1193AccountInterface_eip1193Provider = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWlwMTE5My5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBvcnRzL2VpcDExOTMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrSEFBa0g7QUFDbEgscUVBQXFFO0FBQ3JFLGtFQUFrRTtBQUNsRSwyRUFBMkU7QUFDM0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDakUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQyxtSUFBbUk7QUFDbkksTUFBTSxPQUFPLGNBQWUsU0FBUSxhQUFhO0lBSS9DOzs7OztPQUtHO0lBQ0gsWUFBWSxlQUFlLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxRQUFRO1FBQ3pELE1BQU0sb0JBQW9CLEdBQUcsbUNBQW1DLENBQUMsQ0FDL0QsZUFBZSxDQUNoQixDQUFDO1FBQ0YsTUFBTSxPQUFPLEdBQUcsSUFBSSx1QkFBdUIsQ0FDekMsZUFBZSxFQUNmLG9CQUFvQixFQUNwQixRQUFRLENBQ1QsQ0FBQztRQUNGLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFsQnRCLDZDQUE2QztRQUM3QyxrREFBaUI7UUFrQmYsdUJBQUEsSUFBSSxtQ0FBb0Isb0JBQW9CLE1BQUEsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsNkJBQTZCLENBQUMsZUFBZTtRQUNqRCxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQyxNQUFNLFVBQVUsR0FBRyxNQUFNLHVCQUFBLElBQUksdUNBQWlCLENBQUMsT0FBTyxDQUFDO1lBQ3JELE1BQU0sRUFBRSxxQ0FBcUM7WUFDN0MsTUFBTSxFQUFFO2dCQUNOO29CQUNFLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRTtv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
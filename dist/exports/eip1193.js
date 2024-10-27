import { AccountWallet, AuthWitness, Fr, TxExecutionRequest, } from "@aztec/aztec.js";
import { serde } from "../serde.js";
export class AztecEip1193Account extends AccountWallet {
    constructor(completeAddress, eip1193Provider, pxe, nodeInfo) {
        const account = new Eip1193AccountInterface(completeAddress, eip1193Provider, nodeInfo);
        super(pxe, account);
        this.eip1193Provider = eip1193Provider;
    }
    async experimental_createSecretHash(contractAddress) {
        const { Fr } = await import("@aztec/aztec.js");
        const secretHash = await this.eip1193Provider.request({
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
    async experimental_redeemShield(token, amount, secretHash, txHash) {
        const { SentTx, TxHash } = await import("@aztec/aztec.js");
        const redeemTxHash = this.eip1193Provider
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
}
class Eip1193AccountInterface {
    /**
     * @param {CompleteAddress} address
     * @param {TypedEip1193Provider} rpc
     * @param {NodeInfo} nodeInfo
     */
    constructor(address, rpc, nodeInfo) {
        this.completeAddress = address;
        this.eip1193Provider = rpc;
        this.nodeInfo = nodeInfo;
    }
    getCompleteAddress() {
        return this.completeAddress;
    }
    /**
     *  @param {Fr} messageHash
     */
    async createAuthWit(messageHash) {
        await this.eip1193Provider.request({
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
    async createTxExecutionRequest(executions) {
        const { calls } = executions;
        if (calls.length > 1) {
            throw new Error(`Expected a single call, got ${calls.length}`);
        }
        const serializedExecs = await Promise.all(calls.map((e) => serde.FunctionCall.serialize(e)));
        const result = await this.eip1193Provider.request({
            method: "aztec_createTxExecutionRequest",
            params: [
                {
                    from: this.completeAddress.toString(),
                    calls: serializedExecs,
                },
            ],
        });
        return TxExecutionRequest.fromString(result);
    }
    getAddress() {
        return this.completeAddress.address;
    }
    getChainId() {
        return new Fr(this.nodeInfo.l1ChainId);
    }
    getVersion() {
        return new Fr(this.nodeInfo.protocolVersion);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWlwMTE5My5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBvcnRzL2VpcDExOTMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNOLGFBQWEsRUFDYixXQUFXLEVBRVgsRUFBRSxFQUNGLGtCQUFrQixHQUlsQixNQUFNLGlCQUFpQixDQUFDO0FBRXpCLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFLcEMsTUFBTSxPQUFPLG1CQUFvQixTQUFRLGFBQWE7SUFHckQsWUFDQyxlQUFnQyxFQUNoQyxlQUFxQyxFQUNyQyxHQUFRLEVBQ1IsUUFBa0I7UUFFbEIsTUFBTSxPQUFPLEdBQUcsSUFBSSx1QkFBdUIsQ0FDMUMsZUFBZSxFQUNmLGVBQWUsRUFDZixRQUFRLENBQ1IsQ0FBQztRQUNGLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDeEMsQ0FBQztJQUVELEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxlQUFzQztRQUN6RSxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUMvQyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO1lBQ3JELE1BQU0sRUFBRSxxQ0FBcUM7WUFDN0MsTUFBTSxFQUFFO2dCQUNQO29CQUNDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRTtvQkFDMUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxRQUFRLEVBQUU7aUJBQ3BDO2FBQ0Q7U0FDRCxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxLQUFLLENBQUMseUJBQXlCLENBQzlCLEtBQTRCLEVB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
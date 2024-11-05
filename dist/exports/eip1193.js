var _Eip1193Account_eip1193Provider, _Eip1193Account_pendingAuthWits, _Eip1193AccountInterface_completeAddress, _Eip1193AccountInterface_nodeInfo, _Eip1193AccountInterface_pendingAuthWits;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { AccountWallet, AuthWitness, Fr, } from "@aztec/aztec.js";
import { serde } from "../serde.js";
// This is a terrible hack. More info here https://discord.com/channels/1144692727120937080/1215729116716728410/1215729116716728410
export class Eip1193Account extends AccountWallet {
    constructor(completeAddress, eip1193Provider, pxe, nodeInfo) {
        const typedEip1193Provider = eip1193Provider;
        const pendingAuthwits = [];
        const account = new Eip1193AccountInterface(completeAddress, nodeInfo, pendingAuthwits);
        super(pxe, account);
        _Eip1193Account_eip1193Provider.set(this, void 0);
        /**
         * HACK: this is a super hack until Aztec implements proper RPC with wallets.
         * The flow is to collect all AuthWit requests and send them in one aztec_sendTransaction RPC call.
         */
        _Eip1193Account_pendingAuthWits.set(this, void 0);
        __classPrivateFieldSet(this, _Eip1193Account_eip1193Provider, typedEip1193Provider, "f");
        __classPrivateFieldSet(this, _Eip1193Account_pendingAuthWits, pendingAuthwits, "f");
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async sendTx(tx) {
        const { TxHash } = await import("@aztec/aztec.js");
        const serializedExecs = await Promise.all(tx.executions.calls.map((e) => serde.FunctionCall.serialize(e)));
        const result = await __classPrivateFieldGet(this, _Eip1193Account_eip1193Provider, "f").request({
            method: "aztec_sendTransaction",
            params: [
                {
                    from: this.account.getAddress().toString(),
                    calls: serializedExecs,
                    authWitnesses: __classPrivateFieldGet(this, _Eip1193Account_pendingAuthWits, "f").map((x) => x.toString()),
                },
            ],
        });
        __classPrivateFieldGet(this, _Eip1193Account_pendingAuthWits, "f").splice(0, __classPrivateFieldGet(this, _Eip1193Account_pendingAuthWits, "f").length); // clear
        console.log("result: ", result);
        return TxHash.fromString(result);
    }
    async proveTx(txRequest, privateExecutionResult) {
        // forward data to `this.sendTx`
        return {
            privateExecutionResult,
            ...txRequest,
            toTx() {
                return this;
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        };
    }
    async simulateTx(txRequest, simulatePublic, msgSender, skipTxValidation) {
        return {
            simulatePublic,
            msgSender,
            skipTxValidation,
            ...txRequest,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        };
    }
    async createTxExecutionRequest(executions) {
        // forward data to `this.simulateTx`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { executions };
    }
}
_Eip1193Account_eip1193Provider = new WeakMap(), _Eip1193Account_pendingAuthWits = new WeakMap();
class Eip1193AccountInterface {
    constructor(address, nodeInfo, pendingAuthWits) {
        _Eip1193AccountInterface_completeAddress.set(this, void 0);
        _Eip1193AccountInterface_nodeInfo.set(this, void 0);
        _Eip1193AccountInterface_pendingAuthWits.set(this, void 0);
        __classPrivateFieldSet(this, _Eip1193AccountInterface_completeAddress, address, "f");
        __classPrivateFieldSet(this, _Eip1193AccountInterface_nodeInfo, nodeInfo, "f");
        __classPrivateFieldSet(this, _Eip1193AccountInterface_pendingAuthWits, pendingAuthWits, "f");
    }
    getCompleteAddress() {
        return __classPrivateFieldGet(this, _Eip1193AccountInterface_completeAddress, "f");
    }
    async createAuthWit(messageHash) {
        __classPrivateFieldGet(this, _Eip1193AccountInterface_pendingAuthWits, "f").push(messageHash);
        return new AuthWitness(Fr.random(), []);
    }
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
_Eip1193AccountInterface_completeAddress = new WeakMap(), _Eip1193AccountInterface_nodeInfo = new WeakMap(), _Eip1193AccountInterface_pendingAuthWits = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWlwMTE5My5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9leHBvcnRzL2VpcDExOTMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEVBQ04sYUFBYSxFQUNiLFdBQVcsRUFHWCxFQUFFLEdBS0YsTUFBTSxpQkFBaUIsQ0FBQztBQUl6QixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR3BDLG1JQUFtSTtBQUNuSSxNQUFNLE9BQU8sY0FBZSxTQUFRLGFBQWE7SUFTaEQsWUFDQyxlQUFnQyxFQUNoQyxlQUFnQyxFQUNoQyxHQUFRLEVBQ1IsUUFBa0I7UUFFbEIsTUFBTSxvQkFBb0IsR0FBRyxlQUF1QyxDQUFDO1FBQ3JFLE1BQU0sZUFBZSxHQUFTLEVBQUUsQ0FBQztRQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLHVCQUF1QixDQUMxQyxlQUFlLEVBQ2YsUUFBUSxFQUNSLGVBQWUsQ0FDZixDQUFDO1FBQ0YsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQXJCWixrREFBdUM7UUFFaEQ7OztXQUdHO1FBQ00sa0RBQXVCO1FBZ0IvQix1QkFBQSxJQUFJLG1DQUFvQixvQkFBb0IsTUFBQSxDQUFDO1FBQzdDLHVCQUFBLElBQUksbUNBQW9CLGVBQWUsTUFBQSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxLQUFLLENBQUMsNkJBQTZCLENBQUMsZUFBc0M7UUFDekUsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDL0MsTUFBTSxVQUFVLEdBQUcsTUFBTSx1QkFBQSxJQUFJLHVDQUFpQixDQUFDLE9BQU8sQ0FBQztZQUN0RCxNQUFNLEVBQUUscUNBQXFDO1lBQzdDLE1BQU0sRUFBRTtnQkFDUDtvQkFDQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUU7b0JBQzFDLFFBQVEsRUFBRSxlQUFlLENBQUMsUUFBUSxFQUFFO2lCQUNwQzthQUNEO1NBQ0QsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsS0FBSyxDQUFDLHlCQUF5QixDQUM5QixLQUE0QixFQUM1QixNQUE0QixFQUM1QixVQUFnQyxFQUNoQyxNQUF1QjtRQUV2QixNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDM0QsTUFBTSxZQUFZLEdBQUcsdUJBQUEsSUFBSSx1Q0FBaUI7YUFDeEMsT0FBTyxDQUFDO1lBQ1IsTUFBTSxFQUFFLHNDQUFzQztZQUM5QyxNQUFNLEVBQUU7Z0JBQ1A7b0JBQ0MsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUMxQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDdkIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQ3pCLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFO29CQUNqQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRTtpQkFDekI7YUFDRDtTQUNELENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU5QyxPQUFPLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELDhEQUE4RDtJQUNyRCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQU87UUFDNUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDbkQsTUFBTSxlQUFlLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUN2QyxFQUFFLENBQUMsVUFBbUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDdkQsS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQy9CLENBQ0QsQ0FBQztRQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sdUJBQUEsSUFBSSx1Q0FBaUIsQ0FBQyxPQUFPLENBQUM7WUFDbEQsTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixNQUFNLEVBQUU7Z0JBQ1A7b0JBQ0MsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxFQUFFO29CQUMxQyxLQUFLLEVBQUUsZUFBZTtvQkFDdEIsYUFBYSxFQUFFLHVCQUFBLElBQUksdUNBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQzdEO2FBQ0Q7U0FDRCxDQUFDLENBQUM7UUFDSCx1QkFBQSxJQUFJLHVDQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsdUJBQUEsSUFBSSx1Q0FBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVE7UUFDdkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEMsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFUSxLQUFLLENBQUMsT0FBTyxDQUNyQixTQUE2QixFQUM3QixzQkFBOEM7UUFFOUMsZ0NBQWdDO1FBQ2hDLE9BQU87WUFDTixzQkFBc0I7WUFDdEIsR0FBRyxTQUFTO1lBQ1osSUFBSTtnQkFDSCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFDRCw4REFBOEQ7U0FDdkQsQ0FBQztJQUNWLENBQUM7SUFFUSxLQUFLLENBQUMsVUFBVSxDQUN4QixTQUE2QixFQUM3QixjQUF1QixFQUN2QixTQUF1QixFQUN2QixnQkFBeUI7UUFFekIsT0FBTztZQUNOLGNBQWM7WUFDZCxTQUFTO1lBQ1QsZ0JBQWdCO1lBQ2hCLEdBQUcsU0FBUztZQUNaLDhEQUE4RDtTQUN2RCxDQUFDO0lBQ1YsQ0FBQztJQUVRLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxVQUFnQztRQUN2RSxvQ0FBb0M7UUFDcEMsOERBQThEO1FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQVMsQ0FBQztJQUM5QixDQUFDO0NBQ0Q7O0FBQ0QsTUFBTSx1QkFBdUI7SUFPNUIsWUFDQyxPQUF3QixFQUN4QixRQUFrQixFQUNsQixlQUFxQjtRQVRiLDJEQUFrQztRQUVsQyxvREFBb0I7UUFFcEIsMkRBQXVCO1FBTy9CLHVCQUFBLElBQUksNENBQW9CLE9BQU8sTUFBQSxDQUFDO1FBQ2hDLHVCQUFBLElBQUkscUNBQWEsUUFBUSxNQUFBLENBQUM7UUFDMUIsdUJBQUEsSUFBSSw0Q0FBb0IsZUFBZSxNQUFBLENBQUM7SUFDekMsQ0FBQztJQUVELGtCQUFrQjtRQUNqQixPQUFPLHVCQUFBLElBQUksZ0RBQWlCLENBQUM7SUFDOUIsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsV0FBZTtRQUNsQyx1QkFBQSxJQUFJLGdEQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4QyxPQUFPLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsS0FBSyxDQUFDLHdCQUF3QjtRQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELFVBQVU7UUFDVCxPQUFPLHVCQUFBLElBQUksZ0RBQWlCLENBQUMsT0FBTyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxVQUFVO1FBQ1QsT0FBTyxJQUFJLEVBQUUsQ0FBQyx1QkFBQSxJQUFJLHlDQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELFVBQVU7UUFDVCxPQUFPLElBQUksRUFBRSxDQUFDLHVCQUFBLElBQUkseUNBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0QifQ==
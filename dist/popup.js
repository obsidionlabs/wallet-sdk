var _ObsidonWalletSDK_instances, _ObsidonWalletSDK_pxe, _ObsidonWalletSDK_communicator, _ObsidonWalletSDK_pendingRequestsCount, _ObsidonWalletSDK_connectedAccountCompleteAddress, _ObsidonWalletSDK_account, _ObsidonWalletSDK_requestPopup;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { persisted } from "svelte-persisted-store";
import { get, readonly, writable } from "svelte/store";
import { assert } from "ts-essentials";
import { Communicator } from "./Communicator.js";
import { OBSIDON_WALLET_URL, accountFromCompleteAddress, resolvePxe, } from "./utils.js";
export class ObsidonWalletSDK {
    constructor(pxe, params = {}) {
        _ObsidonWalletSDK_instances.add(this);
        _ObsidonWalletSDK_pxe.set(this, void 0);
        _ObsidonWalletSDK_communicator.set(this, void 0);
        _ObsidonWalletSDK_pendingRequestsCount.set(this, 0);
        _ObsidonWalletSDK_connectedAccountCompleteAddress.set(this, persisted("shield-wallet-connected-complete-address", null));
        _ObsidonWalletSDK_account.set(this, writable(undefined));
        this.accountObservable = readonly(__classPrivateFieldGet(this, _ObsidonWalletSDK_account, "f"));
        __classPrivateFieldSet(this, _ObsidonWalletSDK_pxe, resolvePxe(pxe), "f");
        __classPrivateFieldSet(this, _ObsidonWalletSDK_communicator, new Communicator({
            url: `${OBSIDON_WALLET_URL}/confirm`,
            ...params,
        }), "f");
        let accountId = 0;
        __classPrivateFieldGet(this, _ObsidonWalletSDK_connectedAccountCompleteAddress, "f").subscribe(async (completeAddress) => {
            const thisAccountId = ++accountId;
            const { CompleteAddress } = await import("@aztec/aztec.js");
            const account = completeAddress
                ? await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ObsidonWalletSDK_pxe, "f").call(this), CompleteAddress.fromString(completeAddress))
                : undefined;
            if (thisAccountId !== accountId) {
                // prevent race condition
                return;
            }
            __classPrivateFieldGet(this, _ObsidonWalletSDK_account, "f").set(account);
        });
    }
    getAccount() {
        return get(__classPrivateFieldGet(this, _ObsidonWalletSDK_account, "f"));
    }
    async connect() {
        const { CompleteAddress } = await import("@aztec/aztec.js");
        const result = await this.request({
            method: "aztec_requestAccounts",
            params: [],
        });
        console.log("result in connect: ", result);
        const [address] = result;
        assert(address, "No accounts found");
        const account = await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ObsidonWalletSDK_pxe, "f").call(this), CompleteAddress.fromString(address));
        __classPrivateFieldGet(this, _ObsidonWalletSDK_connectedAccountCompleteAddress, "f").set(address);
        return account;
    }
    async disconnect() {
        __classPrivateFieldGet(this, _ObsidonWalletSDK_connectedAccountCompleteAddress, "f").set(null);
    }
    /**
     * @deprecated not needed anymore
     */
    async reconnect() { }
    /**
     * Sends a raw RPC request to the user's wallet.
     */
    async request(request) {
        console.log("request: ", request);
        const result = await __classPrivateFieldGet(this, _ObsidonWalletSDK_instances, "m", _ObsidonWalletSDK_requestPopup).call(this, request);
        console.log("result in request: ", result);
        return result;
    }
}
_ObsidonWalletSDK_pxe = new WeakMap(), _ObsidonWalletSDK_communicator = new WeakMap(), _ObsidonWalletSDK_pendingRequestsCount = new WeakMap(), _ObsidonWalletSDK_connectedAccountCompleteAddress = new WeakMap(), _ObsidonWalletSDK_account = new WeakMap(), _ObsidonWalletSDK_instances = new WeakSet(), _ObsidonWalletSDK_requestPopup = async function _ObsidonWalletSDK_requestPopup(request) {
    var _a, _b;
    console.log("requestPopup...");
    __classPrivateFieldSet(this, _ObsidonWalletSDK_pendingRequestsCount, (_a = __classPrivateFieldGet(this, _ObsidonWalletSDK_pendingRequestsCount, "f"), _a++, _a), "f");
    // TODO: handle batch requests
    try {
        const rpcRequest = {
            id: crypto.randomUUID(),
            jsonrpc: "2.0",
            method: request.method,
            params: request.params,
        };
        console.log("rpcRequest: ", rpcRequest);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = (await __classPrivateFieldGet(this, _ObsidonWalletSDK_communicator, "f").postRequestAndWaitForResponse({
            requestId: crypto.randomUUID(),
            data: rpcRequest,
        }))?.data;
        console.log("response: ", response);
        // if ("error" in response) {
        // 	console.log("response.error: ", response.error);
        // 	throw new Error(JSON.stringify(response.error));
        // }
        return response.result ? response.result : "mock response";
    }
    finally {
        console.log("finally...");
        __classPrivateFieldSet(this, _ObsidonWalletSDK_pendingRequestsCount, (_b = __classPrivateFieldGet(this, _ObsidonWalletSDK_pendingRequestsCount, "f"), _b--, _b), "f");
        const disconnectIfNoPendingRequests = () => {
            if (__classPrivateFieldGet(this, _ObsidonWalletSDK_pendingRequestsCount, "f") <= 0) {
                __classPrivateFieldGet(this, _ObsidonWalletSDK_communicator, "f").disconnect();
            }
        };
        if (finalMethods.includes(request.method)) {
            disconnectIfNoPendingRequests();
        }
        else {
            setTimeout(disconnectIfNoPendingRequests, 1000);
        }
    }
};
const finalMethods = [
    "aztec_requestAccounts",
    "aztec_sendTransaction",
    "aztec_createTxExecutionRequest",
    "aztec_experimental_tokenRedeemShield",
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcG9wdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxNQUFNLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQTBCLE1BQU0sbUJBQW1CLENBQUM7QUFPekUsT0FBTyxFQUNOLGtCQUFrQixFQUNsQiwwQkFBMEIsRUFDMUIsVUFBVSxHQUNWLE1BQU0sWUFBWSxDQUFDO0FBRXBCLE1BQU0sT0FBTyxnQkFBZ0I7SUFjNUIsWUFDQyxHQUFtQyxFQUNuQyxTQUtJLEVBQUU7O1FBcEJFLHdDQUE2QjtRQUU3QixpREFBNEI7UUFFckMsaURBQXdCLENBQUMsRUFBQztRQUVqQiw0REFBbUMsU0FBUyxDQUNwRCwwQ0FBMEMsRUFDMUMsSUFBSSxDQUNKLEVBQUM7UUFDTyxvQ0FBVyxRQUFRLENBQWtDLFNBQVMsQ0FBQyxFQUFDO1FBQ2hFLHNCQUFpQixHQUFHLFFBQVEsQ0FBQyx1QkFBQSxJQUFJLGlDQUFTLENBQUMsQ0FBQztRQVdwRCx1QkFBQSxJQUFJLHlCQUFRLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBQSxDQUFDO1FBQzVCLHVCQUFBLElBQUksa0NBQWlCLElBQUksWUFBWSxDQUFDO1lBQ3JDLEdBQUcsRUFBRSxHQUFHLGtCQUFrQixVQUFVO1lBQ3BDLEdBQUcsTUFBTTtTQUNULENBQUMsTUFBQSxDQUFDO1FBRUgsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLHVCQUFBLElBQUkseURBQWlDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsRUFBRTtZQUN6RSxNQUFNLGFBQWEsR0FBRyxFQUFFLFNBQVMsQ0FBQztZ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
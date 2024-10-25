var _ShieldswapWalletSdk_instances, _ShieldswapWalletSdk_pxe, _ShieldswapWalletSdk_communicator, _ShieldswapWalletSdk_pendingRequestsCount, _ShieldswapWalletSdk_connectedAccountCompleteAddress, _ShieldswapWalletSdk_account, _ShieldswapWalletSdk_requestPopup;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { persisted } from "svelte-persisted-store";
import { get, readonly, writable } from "svelte/store";
import { assert } from "ts-essentials";
import { Communicator } from "./Communicator.js";
import { SHIELDSWAP_WALLET_URL, accountFromCompleteAddress, resolvePxe, } from "./utils.js";
export class ShieldswapWalletSdk {
    constructor(pxe, params = {}) {
        _ShieldswapWalletSdk_instances.add(this);
        _ShieldswapWalletSdk_pxe.set(this, void 0);
        _ShieldswapWalletSdk_communicator.set(this, void 0);
        _ShieldswapWalletSdk_pendingRequestsCount.set(this, 0);
        _ShieldswapWalletSdk_connectedAccountCompleteAddress.set(this, persisted("shield-wallet-connected-complete-address", null));
        _ShieldswapWalletSdk_account.set(this, writable(undefined));
        this.accountObservable = readonly(__classPrivateFieldGet(this, _ShieldswapWalletSdk_account, "f"));
        __classPrivateFieldSet(this, _ShieldswapWalletSdk_pxe, resolvePxe(pxe), "f");
        __classPrivateFieldSet(this, _ShieldswapWalletSdk_communicator, new Communicator({
            url: `${SHIELDSWAP_WALLET_URL}/sign`,
            ...params,
        }), "f");
        let accountId = 0;
        __classPrivateFieldGet(this, _ShieldswapWalletSdk_connectedAccountCompleteAddress, "f").subscribe(async (completeAddress) => {
            const thisAccountId = ++accountId;
            const { CompleteAddress } = await import("@aztec/aztec.js");
            const account = completeAddress
                ? await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ShieldswapWalletSdk_pxe, "f").call(this), CompleteAddress.fromString(completeAddress))
                : undefined;
            if (thisAccountId !== accountId) {
                // prevent race condition
                return;
            }
            __classPrivateFieldGet(this, _ShieldswapWalletSdk_account, "f").set(account);
        });
    }
    getAccount() {
        return get(__classPrivateFieldGet(this, _ShieldswapWalletSdk_account, "f"));
    }
    async connect() {
        const { CompleteAddress } = await import("@aztec/aztec.js");
        const result = await this.request({
            method: "aztec_requestAccounts",
            params: [],
        });
        const [address] = result;
        assert(address, "No accounts found");
        const account = await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ShieldswapWalletSdk_pxe, "f").call(this), CompleteAddress.fromString(address));
        __classPrivateFieldGet(this, _ShieldswapWalletSdk_connectedAccountCompleteAddress, "f").set(address);
        return account;
    }
    async disconnect() {
        __classPrivateFieldGet(this, _ShieldswapWalletSdk_connectedAccountCompleteAddress, "f").set(null);
    }
    /**
     * @deprecated not needed anymore
     */
    async reconnect() { }
    /**
     * Sends a raw RPC request to the user's wallet.
     */
    async request(request) {
        const result = await __classPrivateFieldGet(this, _ShieldswapWalletSdk_instances, "m", _ShieldswapWalletSdk_requestPopup).call(this, request);
        return result;
    }
}
_ShieldswapWalletSdk_pxe = new WeakMap(), _ShieldswapWalletSdk_communicator = new WeakMap(), _ShieldswapWalletSdk_pendingRequestsCount = new WeakMap(), _ShieldswapWalletSdk_connectedAccountCompleteAddress = new WeakMap(), _ShieldswapWalletSdk_account = new WeakMap(), _ShieldswapWalletSdk_instances = new WeakSet(), _ShieldswapWalletSdk_requestPopup = async function _ShieldswapWalletSdk_requestPopup(request) {
    var _a, _b;
    __classPrivateFieldSet(this, _ShieldswapWalletSdk_pendingRequestsCount, (_a = __classPrivateFieldGet(this, _ShieldswapWalletSdk_pendingRequestsCount, "f"), _a++, _a), "f");
    // TODO: handle batch requests
    try {
        const rpcRequest = {
            id: crypto.randomUUID(),
            jsonrpc: "2.0",
            method: request.method,
            params: request.params,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = (await __classPrivateFieldGet(this, _ShieldswapWalletSdk_communicator, "f").postRequestAndWaitForResponse({
            requestId: crypto.randomUUID(),
            data: rpcRequest,
        }))?.data;
        if ("error" in response) {
            throw new Error(JSON.stringify(response.error));
        }
        return response.result;
    }
    finally {
        __classPrivateFieldSet(this, _ShieldswapWalletSdk_pendingRequestsCount, (_b = __classPrivateFieldGet(this, _ShieldswapWalletSdk_pendingRequestsCount, "f"), _b--, _b), "f");
        const disconnectIfNoPendingRequests = () => {
            if (__classPrivateFieldGet(this, _ShieldswapWalletSdk_pendingRequestsCount, "f") <= 0) {
                __classPrivateFieldGet(this, _ShieldswapWalletSdk_communicator, "f").disconnect();
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
    "aztec_experimental_tokenRedeemShield",
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcG9wdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxNQUFNLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQTBCLE1BQU0sbUJBQW1CLENBQUM7QUFPekUsT0FBTyxFQUNOLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIsVUFBVSxHQUNWLE1BQU0sWUFBWSxDQUFDO0FBRXBCLE1BQU0sT0FBTyxtQkFBbUI7SUFjL0IsWUFDQyxHQUFtQyxFQUNuQyxTQUtJLEVBQUU7O1FBcEJFLDJDQUE2QjtRQUU3QixvREFBNEI7UUFFckMsb0RBQXdCLENBQUMsRUFBQztRQUVqQiwrREFBbUMsU0FBUyxDQUNwRCwwQ0FBMEMsRUFDMUMsSUFBSSxDQUNKLEVBQUM7UUFDTyx1Q0FBVyxRQUFRLENBQTZCLFNBQVMsQ0FBQyxFQUFDO1FBQzNELHNCQUFpQixHQUFHLFFBQVEsQ0FBQyx1QkFBQSxJQUFJLG9DQUFTLENBQUMsQ0FBQztRQVdwRCx1QkFBQSxJQUFJLDRCQUFRLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBQSxDQUFDO1FBQzVCLHVCQUFBLElBQUkscUNBQWlCLElBQUksWUFBWSxDQUFDO1lBQ3JDLEdBQUcsRUFBRSxHQUFHLHFCQUFxQixPQUFPO1lBQ3BDLEdBQUcsTUFBTTtTQUNULENBQUMsTUFBQSxDQUFDO1FBRUgsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLHVCQUFBLElBQUksNERBQWlDLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsRUFBRTtZQUN6RSxNQUFNLGFBQWEsR0FBRyxFQUFFLFNBQVMsQ0FBQztZ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
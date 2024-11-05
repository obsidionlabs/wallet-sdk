var _ObsidionWalletSDK_instances, _ObsidionWalletSDK_pxe, _ObsidionWalletSDK_communicator, _ObsidionWalletSDK_pendingRequestsCount, _ObsidionWalletSDK_connectedAccountCompleteAddress, _ObsidionWalletSDK_account, _ObsidionWalletSDK_requestPopup;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { persisted } from "svelte-persisted-store";
import { get, readonly, writable } from "svelte/store";
import { assert } from "ts-essentials";
import { Communicator } from "./Communicator.js";
import { joinURL } from "ufo";
import { SHIELDSWAP_WALLET_URL, accountFromCompleteAddress, resolvePxe, } from "./utils.js";
export class ObsidionWalletSDK {
    constructor(pxe, params = {}) {
        _ObsidionWalletSDK_instances.add(this);
        _ObsidionWalletSDK_pxe.set(this, void 0);
        _ObsidionWalletSDK_communicator.set(this, void 0);
        _ObsidionWalletSDK_pendingRequestsCount.set(this, 0);
        _ObsidionWalletSDK_connectedAccountCompleteAddress.set(this, persisted("shield-wallet-connected-complete-address", null));
        _ObsidionWalletSDK_account.set(this, writable(undefined));
        this.accountObservable = readonly(__classPrivateFieldGet(this, _ObsidionWalletSDK_account, "f"));
        __classPrivateFieldSet(this, _ObsidionWalletSDK_pxe, resolvePxe(pxe), "f");
        this.walletUrl = params.walletUrl ?? SHIELDSWAP_WALLET_URL;
        __classPrivateFieldSet(this, _ObsidionWalletSDK_communicator, new Communicator({
            url: joinURL(this.walletUrl, "/sign"),
            ...params,
        }), "f");
        let accountId = 0;
        __classPrivateFieldGet(this, _ObsidionWalletSDK_connectedAccountCompleteAddress, "f").subscribe(async (completeAddress) => {
            if (typeof window === "undefined") {
                return;
            }
            const thisAccountId = ++accountId;
            const { CompleteAddress } = await import("@aztec/aztec.js");
            const account = completeAddress
                ? await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ObsidionWalletSDK_pxe, "f").call(this), CompleteAddress.fromString(completeAddress))
                : undefined;
            if (thisAccountId !== accountId) {
                // prevent race condition
                return;
            }
            __classPrivateFieldGet(this, _ObsidionWalletSDK_account, "f").set(account);
        });
    }
    getAccount() {
        return get(__classPrivateFieldGet(this, _ObsidionWalletSDK_account, "f"));
    }
    async getSelectedAccount() {
        const { CompleteAddress } = await import("@aztec/aztec.js");
        const result = await this.request({
            method: "aztec_accounts",
            params: [],
        });
        const [address] = result;
        assert(address, "No accounts found");
        const account = await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ObsidionWalletSDK_pxe, "f").call(this), CompleteAddress.fromString(address));
        __classPrivateFieldGet(this, _ObsidionWalletSDK_connectedAccountCompleteAddress, "f").set(address);
        return account;
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
        const account = await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ObsidionWalletSDK_pxe, "f").call(this), CompleteAddress.fromString(address));
        __classPrivateFieldGet(this, _ObsidionWalletSDK_connectedAccountCompleteAddress, "f").set(address);
        return account;
    }
    async disconnect() {
        __classPrivateFieldGet(this, _ObsidionWalletSDK_connectedAccountCompleteAddress, "f").set(null);
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
        const result = await __classPrivateFieldGet(this, _ObsidionWalletSDK_instances, "m", _ObsidionWalletSDK_requestPopup).call(this, request);
        console.log("result in request: ", result);
        return result;
    }
}
_ObsidionWalletSDK_pxe = new WeakMap(), _ObsidionWalletSDK_communicator = new WeakMap(), _ObsidionWalletSDK_pendingRequestsCount = new WeakMap(), _ObsidionWalletSDK_connectedAccountCompleteAddress = new WeakMap(), _ObsidionWalletSDK_account = new WeakMap(), _ObsidionWalletSDK_instances = new WeakSet(), _ObsidionWalletSDK_requestPopup = async function _ObsidionWalletSDK_requestPopup(request) {
    var _a, _b;
    console.log("requestPopup...");
    __classPrivateFieldSet(this, _ObsidionWalletSDK_pendingRequestsCount, (_a = __classPrivateFieldGet(this, _ObsidionWalletSDK_pendingRequestsCount, "f"), _a++, _a), "f");
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
        const response = (await __classPrivateFieldGet(this, _ObsidionWalletSDK_communicator, "f").postRequestAndWaitForResponse({
            requestId: crypto.randomUUID(),
            data: rpcRequest,
        }))?.data;
        console.log("response: ", response);
        if ("error" in response) {
            throw new Error(JSON.stringify(response.error));
        }
        return response.result ? response.result : "mock response";
    }
    finally {
        console.log("finally...");
        __classPrivateFieldSet(this, _ObsidionWalletSDK_pendingRequestsCount, (_b = __classPrivateFieldGet(this, _ObsidionWalletSDK_pendingRequestsCount, "f"), _b--, _b), "f");
        const disconnectIfNoPendingRequests = () => {
            if (__classPrivateFieldGet(this, _ObsidionWalletSDK_pendingRequestsCount, "f") <= 0) {
                __classPrivateFieldGet(this, _ObsidionWalletSDK_communicator, "f").disconnect();
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
    "aztec_accounts",
    "aztec_requestAccounts",
    "aztec_sendTransaction",
    "aztec_createTxExecutionRequest",
    "aztec_experimental_tokenRedeemShield",
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcG9wdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxNQUFNLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQTBCLE1BQU0sbUJBQW1CLENBQUM7QUFFekUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQU05QixPQUFPLEVBQ04scUJBQXFCLEVBQ3JCLDBCQUEwQixFQUMxQixVQUFVLEdBQ1YsTUFBTSxZQUFZLENBQUM7QUFFcEIsTUFBTSxPQUFPLGlCQUFpQjtJQWdCN0IsWUFDQyxHQUFtQyxFQUNuQyxTQU1JLEVBQUU7O1FBdkJFLHlDQUE2QjtRQUU3QixrREFBNEI7UUFFckMsa0RBQXdCLENBQUMsRUFBQztRQUVqQiw2REFBbUMsU0FBUyxDQUNwRCwwQ0FBMEMsRUFDMUMsSUFBSSxDQUNKLEVBQUM7UUFDTyxxQ0FBVyxRQUFRLENBQTZCLFNBQVMsQ0FBQyxFQUFDO1FBQzNELHNCQUFpQixHQUFHLFFBQVEsQ0FBQyx1QkFBQSxJQUFJLGtDQUFTLENBQUMsQ0FBQztRQWNwRCx1QkFBQSxJQUFJLDBCQUFRLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBQSxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQztRQUMzRCx1QkFBQSxJQUFJLG1DQUFpQixJQUFJLFlBQVksQ0FBQztZQUNyQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1lBQ3JDLEdBQUcsTUFBTTtTQUNULENBQUMsTUFBQSxDQUFDO1FBRUgsSUFB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
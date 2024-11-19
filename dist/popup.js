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
    "aztec_experimental_tokenRedeemShield",
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcG9wdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxNQUFNLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQTBCLE1BQU0sbUJBQW1CLENBQUM7QUFFekUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQU05QixPQUFPLEVBQ04scUJBQXFCLEVBQ3JCLDBCQUEwQixFQUMxQixVQUFVLEdBQ1YsTUFBTSxZQUFZLENBQUM7QUFFcEIsTUFBTSxPQUFPLGlCQUFpQjtJQWdCN0IsWUFDQyxHQUFtQyxFQUNuQyxTQU1JLEVBQUU7O1FBdkJFLHlDQUE2QjtRQUU3QixrREFBNEI7UUFFckMsa0RBQXdCLENBQUMsRUFBQztRQUVqQiw2REFBbUMsU0FBUyxDQUNwRCwwQ0FBMEMsRUFDMUMsSUFBSSxDQUNKLEVBQUM7UUFDTyxxQ0FBVyxRQUFRLENBQTZCLFNBQVMsQ0FBQyxFQUFDO1FBQzNELHNCQUFpQixHQUFHLFFBQVEsQ0FBQyx1QkFBQSxJQUFJLGtDQUFTLENBQUMsQ0FBQztRQWNwRCx1QkFBQSxJQUFJLDBCQUFRLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBQSxDQUFDO1FBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQztRQUMzRCx1QkFBQSxJQUFJLG1DQUFpQixJQUFJLFlBQVksQ0FBQztZQUNyQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO1lBQ3JDLEdBQUcsTUFBTTtTQUNULENBQUMsTUFBQSxDQUFDO1FBRUgsSUFB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
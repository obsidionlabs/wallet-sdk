var _ShieldswapWalletWcSdk_instances, _ShieldswapWalletWcSdk_account, _ShieldswapWalletWcSdk_pxe, _ShieldswapWalletWcSdk_options, _ShieldswapWalletWcSdk_onRequest, _ShieldswapWalletWcSdk_getWeb3Modal, _ShieldswapWalletWcSdk_getSelectedAccount, _ShieldswapWalletWcSdk_getSession;
import { __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
/** @import { TypedEip1193Provider, RpcRequestMap, RpcRequest } from "./types.js" */
/** @import { Eip1193Account } from "./exports/eip1193.js" */
import { getSdkError } from "@walletconnect/utils";
import { get, readonly, writable } from "svelte/store";
import { assert } from "ts-essentials";
import { CAIP, METHODS_NOT_REQUIRING_CONFIRMATION, SHIELDSWAP_WALLET_ICON_URL, SHIELDSWAP_WALLET_NAME, SHIELDSWAP_WALLET_URL, accountFromCompleteAddress, lazyValue, resolvePxe, } from "./utils.js";
/**
 * @implements {TypedEip1193Provider}
 *
 * @deprecated Use ShieldswapWalletSdk instead.
 */
export class ShieldswapWalletWcSdk {
    /**
     * Returns currently selected account if any.
     */
    getAccount() {
        return get(__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f"));
    }
    /**
     * @param {import('./types.js').MyWalletConnectOptions} options
     * @param {(() => import("ts-essentials").AsyncOrSync<import("@aztec/aztec.js").PXE>) | import('@aztec/aztec.js').PXE} pxe
     * @param {import("./types.js").OnRpcConfirmationRequest} [onRequest]
     *
     */
    constructor(options, pxe, onRequest) {
        _ShieldswapWalletWcSdk_instances.add(this);
        /**
         * @readonly
         * @type {import("svelte/store").Writable<Eip1193Account | undefined>}
         */
        _ShieldswapWalletWcSdk_account.set(this, writable(undefined));
        /**
         * @readonly
         * @type {import("svelte/store").Readable<Eip1193Account | undefined>}
         */
        this.accountObservable = readonly(__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f"));
        /**
         * @readonly
         * @type {() => import("ts-essentials").AsyncOrSync<import("@aztec/aztec.js").PXE>}
         */
        _ShieldswapWalletWcSdk_pxe.set(this, void 0);
        /**
         * @readonly
         * @type {ConstructorParameters<typeof import("@walletconnect/modal-sign-html").WalletConnectModalSign>[0]}
         */
        _ShieldswapWalletWcSdk_options.set(this, void 0);
        /**
         * @readonly
         * @type {import("./types.js").OnRpcConfirmationRequest}
         */
        _ShieldswapWalletWcSdk_onRequest.set(this, void 0);
        _ShieldswapWalletWcSdk_getWeb3Modal.set(this, lazyValue(async () => {
            /** @type {import("@walletconnect/modal-sign-html/dist/_types/src/client.js")} */
            const { WalletConnectModalSign } = await import("@walletconnect/modal-sign-html");
            const walletId = "shieldswap"; // TODO: what to put here???
            const web3modal = new WalletConnectModalSign({
                ...__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_options, "f"),
                modalOptions: {
                    ...__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_options, "f").modalOptions,
                    chains: [...(__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_options, "f").modalOptions?.chains ?? []), CAIP.chain()],
                    walletImages: {
                        [walletId]: SHIELDSWAP_WALLET_ICON_URL,
                        ...__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_options, "f").modalOptions?.walletImages,
                    },
                    desktopWallets: [
                        {
                            id: walletId,
                            name: SHIELDSWAP_WALLET_NAME,
                            links: {
                                native: "",
                                universal: SHIELDSWAP_WALLET_URL,
                            },
                        },
                        ...(__classPrivateFieldGet(this, _ShieldswapWalletWcSdk_options, "f").modalOptions?.desktopWallets ?? []),
                    ],
                },
            });
            web3modal.onSessionDelete(() => {
                console.log("session delete");
                __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f").set(undefined);
            });
            web3modal.onSessionExpire(() => {
                console.log("session expire");
                __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f").set(undefined);
            });
            web3modal.onSessionEvent(async (e) => {
                const { CompleteAddress } = await import("@aztec/aztec.js");
                const { event } = e.params;
                if (event.name !== "accountsChanged") {
                    return;
                }
                const newAddress = event.data[0];
                __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f").set(await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_pxe, "f").call(this), CompleteAddress.fromString(newAddress)));
            });
            return web3modal;
        }));
        __classPrivateFieldSet(this, _ShieldswapWalletWcSdk_options, {
            ...options,
            metadata: options.metadata ?? DEFAULT_METADATA,
        }, "f");
        __classPrivateFieldSet(this, _ShieldswapWalletWcSdk_pxe, resolvePxe(pxe), "f");
        __classPrivateFieldSet(this, _ShieldswapWalletWcSdk_onRequest, onRequest ?? (() => { }), "f");
    }
    /**
     * Opens a WalletConnect modal and connects to the user's wallet.
     *
     * Call this when user clicks a "Connect wallet" button.
     *
     * @returns the connected account
     */
    async connect() {
        const web3modal = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_getWeb3Modal, "f").call(this);
        await web3modal.connect({});
        const account = await this.reconnect();
        if (!account) {
            throw new Error("No accounts found");
        }
        return account;
    }
    /**
     * Reconnects to the user's wallet if was previously connected.
     *
     * Call this on page refresh.
     *
     * @returns the connected account
     */
    async reconnect() {
        const address = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_instances, "m", _ShieldswapWalletWcSdk_getSelectedAccount).call(this);
        if (!address) {
            __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f").set(undefined);
            return undefined;
        }
        const account = await accountFromCompleteAddress(this, await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_pxe, "f").call(this), address);
        __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f").set(account);
        return account;
    }
    /**
     * Disconnects from the user's wallet.
     */
    async disconnect() {
        const session = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_instances, "m", _ShieldswapWalletWcSdk_getSession).call(this);
        if (session) {
            const web3modal = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_getWeb3Modal, "f").call(this);
            await web3modal.disconnect({
                topic: session.topic,
                reason: getSdkError("USER_DISCONNECTED"),
            });
        }
        __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_account, "f").set(undefined);
    }
    /**
     * Sends a raw RPC request to the user's wallet.
     *
     * @type {TypedEip1193Provider["request"]}
     */
    async request(request) {
        const abortController = new AbortController();
        if (!METHODS_NOT_REQUIRING_CONFIRMATION.includes(request.method)) {
            __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_onRequest, "f").call(this, request, abortController);
        }
        try {
            const session = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_instances, "m", _ShieldswapWalletWcSdk_getSession).call(this);
            assert(session, "no session");
            const web3modal = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_getWeb3Modal, "f").call(this);
            const result = await web3modal.request({
                chainId: CAIP.chain(),
                topic: session.topic,
                request,
            });
            return result;
        }
        finally {
            abortController.abort();
        }
    }
}
_ShieldswapWalletWcSdk_account = new WeakMap(), _ShieldswapWalletWcSdk_pxe = new WeakMap(), _ShieldswapWalletWcSdk_options = new WeakMap(), _ShieldswapWalletWcSdk_onRequest = new WeakMap(), _ShieldswapWalletWcSdk_getWeb3Modal = new WeakMap(), _ShieldswapWalletWcSdk_instances = new WeakSet(), _ShieldswapWalletWcSdk_getSelectedAccount = async function _ShieldswapWalletWcSdk_getSelectedAccount() {
    const { CompleteAddress } = await import("@aztec/aztec.js");
    const session = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_instances, "m", _ShieldswapWalletWcSdk_getSession).call(this);
    if (!session) {
        return undefined;
    }
    const addresses = await this.request({
        method: "aztec_accounts",
        params: [],
    });
    const address = addresses[0];
    if (address == null) {
        return undefined;
    }
    return CompleteAddress.fromString(address);
}, _ShieldswapWalletWcSdk_getSession = async function _ShieldswapWalletWcSdk_getSession() {
    const web3modal = await __classPrivateFieldGet(this, _ShieldswapWalletWcSdk_getWeb3Modal, "f").call(this);
    const session = await web3modal.getSession();
    return session;
};
const DEFAULT_METADATA = {
    name: "Example dApp",
    description: "",
    url: "https://example.com",
    icons: [],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvd2MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvRkFBb0Y7QUFDcEYsNkRBQTZEO0FBQzdELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQ0wsSUFBSSxFQUNKLGtDQUFrQyxFQUNsQywwQkFBMEIsRUFDMUIsc0JBQXNCLEVBQ3RCLHFCQUFxQixFQUNyQiwwQkFBMEIsRUFDMUIsU0FBUyxFQUNULFVBQVUsR0FDWCxNQUFNLFlBQVksQ0FBQztBQUVwQjs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLHFCQUFxQjtJQWFoQzs7T0FFRztJQUNILFVBQVU7UUFDUixPQUFPLEdBQUcsQ0FBQyx1QkFBQSxJQUFJLHNDQUFTLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBb0JEOzs7OztPQUtHO0lBQ0gsWUFBWSxPQUFPLEVBQUUsR0FBRyxFQUFFLFNBQVM7O1FBM0NuQzs7O1dBR0c7UUFDSCx5Q0FBVyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUM7UUFFL0I7OztXQUdHO1FBQ0gsc0JBQWlCLEdBQUcsUUFBUSxDQUFDLHVCQUFBLElBQUksc0NBQVMsQ0FBQyxDQUFDO1FBUzVDOzs7V0FHRztRQUNILDZDQUFLO1FBRUw7OztXQUdHO1FBQ0gsaURBQVM7UUFFVDs7O1dBR0c7UUFDSCxtREFBVztRQWlCWCw4Q0FBZ0IsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ25DLGlGQUFpRjtZQUNqRixNQUFNLEVBQUUsc0JBQXNCLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FDN0MsZ0NBQWdDLENBQ2pDLENBQUM7WUFDRixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyw0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
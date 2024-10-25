/** @import { TypedEip1193Provider, RpcRequestMap, RpcRequest } from "./types.js" */
/** @import { Eip1193Account } from "./exports/eip1193.js" */
import { getSdkError } from "@walletconnect/utils";
import { get, readonly, writable } from "svelte/store";
import { assert } from "ts-essentials";
import {
  CAIP,
  METHODS_NOT_REQUIRING_CONFIRMATION,
  SHIELDSWAP_WALLET_ICON_URL,
  SHIELDSWAP_WALLET_NAME,
  SHIELDSWAP_WALLET_URL,
  accountFromCompleteAddress,
  lazyValue,
  resolvePxe,
} from "./utils.js";

/**
 * @implements {TypedEip1193Provider}
 *
 * @deprecated Use ShieldswapWalletSdk instead.
 */
export class ShieldswapWalletWcSdk {
  /**
   * @readonly
   * @type {import("svelte/store").Writable<Eip1193Account | undefined>}
   */
  #account = writable(undefined);

  /**
   * @readonly
   * @type {import("svelte/store").Readable<Eip1193Account | undefined>}
   */
  accountObservable = readonly(this.#account);

  /**
   * Returns currently selected account if any.
   */
  getAccount() {
    return get(this.#account);
  }

  /**
   * @readonly
   * @type {() => import("ts-essentials").AsyncOrSync<import("@aztec/aztec.js").PXE>}
   */
  #pxe;

  /**
   * @readonly
   * @type {ConstructorParameters<typeof import("@walletconnect/modal-sign-html").WalletConnectModalSign>[0]}
   */
  #options;

  /**
   * @readonly
   * @type {import("./types.js").OnRpcConfirmationRequest}
   */
  #onRequest;

  /**
   * @param {import('./types.js').MyWalletConnectOptions} options
   * @param {(() => import("ts-essentials").AsyncOrSync<import("@aztec/aztec.js").PXE>) | import('@aztec/aztec.js').PXE} pxe
   * @param {import("./types.js").OnRpcConfirmationRequest} [onRequest]
   *
   */
  constructor(options, pxe, onRequest) {
    this.#options = {
      ...options,
      metadata: options.metadata ?? DEFAULT_METADATA,
    };
    this.#pxe = resolvePxe(pxe);
    this.#onRequest = onRequest ?? (() => {});
  }

  #getWeb3Modal = lazyValue(async () => {
    /** @type {import("@walletconnect/modal-sign-html/dist/_types/src/client.js")} */
    const { WalletConnectModalSign } = await import(
      "@walletconnect/modal-sign-html"
    );
    const walletId = "shieldswap"; // TODO: what to put here???
    const web3modal = new WalletConnectModalSign({
      ...this.#options,
      modalOptions: {
        ...this.#options.modalOptions,
        chains: [...(this.#options.modalOptions?.chains ?? []), CAIP.chain()],
        walletImages: {
          [walletId]: SHIELDSWAP_WALLET_ICON_URL,
          ...this.#options.modalOptions?.walletImages,
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
          ...(this.#options.modalOptions?.desktopWallets ?? []),
        ],
      },
    });
    web3modal.onSessionDelete(() => {
      console.log("session delete");
      this.#account.set(undefined);
    });
    web3modal.onSessionExpire(() => {
      console.log("session expire");
      this.#account.set(undefined);
    });
    web3modal.onSessionEvent(async (e) => {
      const { CompleteAddress } = await import("@aztec/aztec.js");
      const { event } = e.params;
      if (event.name !== "accountsChanged") {
        return;
      }
      const newAddress = event.data[0];
      this.#account.set(
        await accountFromCompleteAddress(
          this,
          await this.#pxe(),
          CompleteAddress.fromString(newAddress),
        ),
      );
    });
    return web3modal;
  });

  /**
   * Opens a WalletConnect modal and connects to the user's wallet.
   *
   * Call this when user clicks a "Connect wallet" button.
   *
   * @returns the connected account
   */
  async connect() {
    const web3modal = await this.#getWeb3Modal();
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
    const address = await this.#getSelectedAccount();
    if (!address) {
      this.#account.set(undefined);
      return undefined;
    }
    const account = await accountFromCompleteAddress(
      this,
      await this.#pxe(),
      address,
    );
    this.#account.set(account);
    return account;
  }

  /**
   * Disconnects from the user's wallet.
   */
  async disconnect() {
    const session = await this.#getSession();
    if (session) {
      const web3modal = await this.#getWeb3Modal();
      await web3modal.disconnect({
        topic: session.topic,
        reason: getSdkError("USER_DISCONNECTED"),
      });
    }
    this.#account.set(undefined);
  }

  async #getSelectedAccount() {
    const { CompleteAddress } = await import("@aztec/aztec.js");
    const session = await this.#getSession();
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
  }

  async #getSession() {
    const web3modal = await this.#getWeb3Modal();
    const session = await web3modal.getSession();
    return session;
  }

  /**
   * Sends a raw RPC request to the user's wallet.
   *
   * @type {TypedEip1193Provider["request"]}
   */
  async request(request) {
    const abortController = new AbortController();
    if (!METHODS_NOT_REQUIRING_CONFIRMATION.includes(request.method)) {
      this.#onRequest(request, abortController);
    }

    try {
      const session = await this.#getSession();
      assert(session, "no session");
      const web3modal = await this.#getWeb3Modal();
      const result = await web3modal.request({
        chainId: CAIP.chain(),
        topic: session.topic,
        request,
      });
      return result;
    } finally {
      abortController.abort();
    }
  }
}

const DEFAULT_METADATA = {
  name: "Example dApp",
  description: "",
  url: "https://example.com",
  icons: [],
};

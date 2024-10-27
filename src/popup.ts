import type { PXE } from "@aztec/aztec.js";
import { persisted } from "svelte-persisted-store";
import { get, readonly, writable } from "svelte/store";
import { assert, type AsyncOrSync } from "ts-essentials";
import { Communicator, type FallbackOpenPopup } from "./Communicator.js";
import type { AztecEip1193Account } from "./exports/eip1193.js";
import type {
	RpcRequest,
	RpcRequestMap,
	TypedEip1193Provider,
} from "./types.js";
import {
	OBSIDON_WALLET_URL,
	accountFromCompleteAddress,
	resolvePxe,
} from "./utils.js";

export class ObsidonWalletSDK implements TypedEip1193Provider {
	readonly #pxe: () => AsyncOrSync<PXE>;

	readonly #communicator: Communicator;

	#pendingRequestsCount = 0;

	readonly #connectedAccountCompleteAddress = persisted<string | null>(
		"shield-wallet-connected-complete-address",
		null
	);
	readonly #account = writable<AztecEip1193Account | undefined>(undefined);
	readonly accountObservable = readonly(this.#account);

	constructor(
		pxe: (() => AsyncOrSync<PXE>) | PXE,
		params: {
			/**
			 * Must call the provided callback right after user clicks a button, so browser does not block it.
			 */
			fallbackOpenPopup?: FallbackOpenPopup;
		} = {}
	) {
		this.#pxe = resolvePxe(pxe);
		this.#communicator = new Communicator({
			url: `${OBSIDON_WALLET_URL}/confirm`,
			...params,
		});

		let accountId = 0;
		this.#connectedAccountCompleteAddress.subscribe(async (completeAddress) => {
			const thisAccountId = ++accountId;

			const { CompleteAddress } = await import("@aztec/aztec.js");

			const account = completeAddress
				? await accountFromCompleteAddress(
						this,
						await this.#pxe(),
						CompleteAddress.fromString(completeAddress)
					)
				: undefined;
			if (thisAccountId !== accountId) {
				// prevent race condition
				return;
			}
			this.#account.set(account);
		});
	}

	getAccount() {
		return get(this.#account);
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
		const account = await accountFromCompleteAddress(
			this,
			await this.#pxe(),
			CompleteAddress.fromString(address)
		);
		this.#connectedAccountCompleteAddress.set(address);
		return account;
	}

	async disconnect() {
		this.#connectedAccountCompleteAddress.set(null);
	}

	/**
	 * @deprecated not needed anymore
	 */
	async reconnect() {}

	/**
	 * Sends a raw RPC request to the user's wallet.
	 */
	async request<M extends keyof RpcRequestMap>(
		request: RpcRequest<M>
	): Promise<ReturnType<RpcRequestMap[M]>> {
		console.log("request: ", request);
		const result = await this.#requestPopup(request);
		console.log("result in request: ", result);
		return result;
	}

	async #requestPopup<M extends keyof RpcRequestMap>(
		request: RpcRequest<M>
	): Promise<ReturnType<RpcRequestMap[M]>> {
		console.log("requestPopup...");
		this.#pendingRequestsCount++;
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
			const response: any = (
				await this.#communicator.postRequestAndWaitForResponse({
					requestId: crypto.randomUUID(),
					data: rpcRequest,
				})
			)?.data;
			console.log("response: ", response);
			// if ("error" in response) {
			// 	console.log("response.error: ", response.error);
			// 	throw new Error(JSON.stringify(response.error));
			// }
			return response.result ? response.result : "mock response";
		} finally {
			console.log("finally...");
			this.#pendingRequestsCount--;

			const disconnectIfNoPendingRequests = () => {
				if (this.#pendingRequestsCount <= 0) {
					this.#communicator.disconnect();
				}
			};

			if (finalMethods.includes(request.method)) {
				disconnectIfNoPendingRequests();
			} else {
				setTimeout(disconnectIfNoPendingRequests, 1000);
			}
		}
	}
}

const finalMethods: readonly (keyof RpcRequestMap)[] = [
	"aztec_requestAccounts",
	"aztec_sendTransaction",
	"aztec_createTxExecutionRequest",
	"aztec_experimental_tokenRedeemShield",
];

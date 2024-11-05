import {
	AccountWallet,
	AuthWitness,
	AztecAddress,
	CompleteAddress,
	Fr,
	TxExecutionRequest,
	TxHash,
	type NodeInfo,
	type PXE,
} from "@aztec/aztec.js";
import type { AccountInterface } from "@aztec/aztec.js/account";
import type { ExecutionRequestInit } from "@aztec/aztec.js/entrypoint";
import type { PrivateExecutionResult } from "@aztec/circuit-types";
import { serde } from "../serde.js";
import type { Eip1193Provider, TypedEip1193Provider } from "../types.js";

// This is a terrible hack. More info here https://discord.com/channels/1144692727120937080/1215729116716728410/1215729116716728410
export class Eip1193Account extends AccountWallet {
	readonly #eip1193Provider: TypedEip1193Provider;

	/**
	 * HACK: this is a super hack until Aztec implements proper RPC with wallets.
	 * The flow is to collect all AuthWit requests and send them in one aztec_sendTransaction RPC call.
	 */
	readonly #pendingAuthWits: Fr[];

	constructor(
		completeAddress: CompleteAddress,
		eip1193Provider: Eip1193Provider,
		pxe: PXE,
		nodeInfo: NodeInfo
	) {
		const typedEip1193Provider = eip1193Provider as TypedEip1193Provider;
		const pendingAuthwits: Fr[] = [];
		const account = new Eip1193AccountInterface(
			completeAddress,
			nodeInfo,
			pendingAuthwits
		);
		super(pxe, account);
		this.#eip1193Provider = typedEip1193Provider;
		this.#pendingAuthWits = pendingAuthwits;
	}

	async experimental_createSecretHash(contractAddress: string | AztecAddress) {
		const { Fr } = await import("@aztec/aztec.js");
		const secretHash = await this.#eip1193Provider.request({
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

	async experimental_redeemShield(
		token: AztecAddress | string,
		amount: Fr | string | bigint,
		secretHash: Fr | string | bigint,
		txHash: TxHash | string
	) {
		const { SentTx, TxHash } = await import("@aztec/aztec.js");
		const redeemTxHash = this.#eip1193Provider
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
	override async sendTx(tx: any) {
		const { TxHash } = await import("@aztec/aztec.js");
		const serializedExecs = await Promise.all(
			(tx.executions as ExecutionRequestInit).calls.map((e) =>
				serde.FunctionCall.serialize(e)
			)
		);
		const result = await this.#eip1193Provider.request({
			method: "aztec_sendTransaction",
			params: [
				{
					from: this.account.getAddress().toString(),
					calls: serializedExecs,
					authWitnesses: this.#pendingAuthWits.map((x) => x.toString()),
				},
			],
		});
		this.#pendingAuthWits.splice(0, this.#pendingAuthWits.length); // clear
		console.log("result: ", result);
		return TxHash.fromString(result);
	}

	override async proveTx(
		txRequest: TxExecutionRequest,
		privateExecutionResult: PrivateExecutionResult
	) {
		// forward data to `this.sendTx`
		return {
			privateExecutionResult,
			...txRequest,
			toTx() {
				return this;
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;
	}

	override async simulateTx(
		txRequest: TxExecutionRequest,
		simulatePublic: boolean,
		msgSender: AztecAddress,
		skipTxValidation: boolean
	) {
		return {
			simulatePublic,
			msgSender,
			skipTxValidation,
			...txRequest,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any;
	}

	override async createTxExecutionRequest(executions: ExecutionRequestInit) {
		// forward data to `this.simulateTx`
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return { executions } as any;
	}
}
class Eip1193AccountInterface implements AccountInterface {
	readonly #completeAddress: CompleteAddress;

	readonly #nodeInfo: NodeInfo;

	readonly #pendingAuthWits: Fr[];

	constructor(
		address: CompleteAddress,
		nodeInfo: NodeInfo,
		pendingAuthWits: Fr[]
	) {
		this.#completeAddress = address;
		this.#nodeInfo = nodeInfo;
		this.#pendingAuthWits = pendingAuthWits;
	}

	getCompleteAddress() {
		return this.#completeAddress;
	}

	async createAuthWit(messageHash: Fr) {
		this.#pendingAuthWits.push(messageHash);
		return new AuthWitness(Fr.random(), []);
	}

	async createTxExecutionRequest(): Promise<TxExecutionRequest> {
		throw new Error("use account.sendTx");
	}

	getAddress() {
		return this.#completeAddress.address;
	}

	getChainId() {
		return new Fr(this.#nodeInfo.l1ChainId);
	}

	getVersion() {
		return new Fr(this.#nodeInfo.protocolVersion);
	}
}

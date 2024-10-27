import {
	AccountWallet,
	AuthWitness,
	AztecAddress,
	Fr,
	TxExecutionRequest,
	type CompleteAddress,
	type NodeInfo,
	type PXE,
} from "@aztec/aztec.js";
import { AccountInterface } from "@aztec/aztec.js/account";
import { serde } from "../serde.js";
import { SerializedFunctionCall, TypedEip1193Provider } from "src/types.js";
import { ExecutionRequestInit } from "@aztec/aztec.js/entrypoint";
import { FunctionCall, TxHash } from "@aztec/circuit-types";

export class AztecEip1193Account extends AccountWallet {
	readonly eip1193Provider: TypedEip1193Provider;

	constructor(
		completeAddress: CompleteAddress,
		eip1193Provider: TypedEip1193Provider,
		pxe: PXE,
		nodeInfo: NodeInfo
	) {
		const account = new Eip1193AccountInterface(
			completeAddress,
			eip1193Provider,
			nodeInfo
		);
		super(pxe, account);
		this.eip1193Provider = eip1193Provider;
	}

	async experimental_createSecretHash(contractAddress: string | AztecAddress) {
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

	async experimental_redeemShield(
		token: AztecAddress | string,
		amount: Fr | string | bigint,
		secretHash: Fr | string | bigint,
		txHash: TxHash | string
	) {
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

class Eip1193AccountInterface implements AccountInterface {
	readonly eip1193Provider: TypedEip1193Provider;
	readonly completeAddress: CompleteAddress;
	readonly nodeInfo: NodeInfo;

	/**
	 * @param {CompleteAddress} address
	 * @param {TypedEip1193Provider} rpc
	 * @param {NodeInfo} nodeInfo
	 */
	constructor(
		address: CompleteAddress,
		rpc: TypedEip1193Provider,
		nodeInfo: NodeInfo
	) {
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
	async createAuthWit(messageHash: Fr) {
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

	async createTxExecutionRequest(
		executions: ExecutionRequestInit
	): Promise<TxExecutionRequest> {
		const { calls } = executions;

		if (calls.length > 1) {
			throw new Error(`Expected a single call, got ${calls.length}`);
		}

		const serializedExecs: SerializedFunctionCall[] = await Promise.all(
			calls.map((e: FunctionCall) => serde.FunctionCall.serialize(e))
		);

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

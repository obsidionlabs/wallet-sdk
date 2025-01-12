import type { FunctionCall } from "@aztec/aztec.js";
import type { FunctionType } from "@aztec/foundation/abi";
import type { SerializedFunctionCall } from "./types.js";

interface SerdeItem<T, S> {
	serialize(value: T): Promise<S>;
	deserialize(value: S): Promise<T>;
}
interface Serde {
	FunctionCall: SerdeItem<FunctionCall, SerializedFunctionCall>;
}

/**
 * @deprecated TODO: think of a better way to do this (serialize as a string using ClassConverter)
 */
export const serde: Serde = {
	FunctionCall: {
		serialize: async (fc) => ({
			selector: fc.selector.toString(),
			name: fc.name,
			type: fc.type,
			isStatic: fc.isStatic,
			to: fc.to.toString(),
			args: fc.args.map((fr) => fr.toString()),
			returnTypes: fc.returnTypes,
		}),
		deserialize: async (fc) => {
			const { Fr, AztecAddress, FunctionSelector } = await import(
				"@aztec/aztec.js"
			);
			return {
				selector: FunctionSelector.fromString(fc.selector),
				name: fc.name,
				type: fc.type as FunctionType,
				isStatic: fc.isStatic,
				to: AztecAddress.fromString(fc.to),
				args: fc.args.map((fr) => new Fr(BigInt(fr))),
				returnTypes: fc.returnTypes,
			};
		},
	},
};

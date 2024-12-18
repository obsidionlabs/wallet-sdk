import { FunctionCall } from "@aztec/circuit-types";
import { FunctionType } from "@aztec/foundation/abi";

FunctionType;

export const serde = {
	FunctionCall: {
		serialize: async (fc: FunctionCall) => ({
			selector: fc.selector.toString(),
			name: fc.name,
			type: fc.type,
			isStatic: fc.isStatic,
			to: fc.to.toString(),
			args: fc.args.map((fr) => fr.toString()),
			returnTypes: fc.returnTypes,
		}),
		deserialize: async (fc: any) => {
			const { Fr, AztecAddress, FunctionSelector } = await import(
				"@aztec/aztec.js"
			);
			return {
				selector: FunctionSelector.fromString(fc.selector),
				name: fc.name,
				type: fc.type,
				isStatic: fc.isStatic == "true",
				to: AztecAddress.fromString(fc.to),
				args: fc.args.map((fr: string) => Fr.fromString(fr)),
				returnTypes: fc.returnTypes,
			} as FunctionCall;
		},
	},
};

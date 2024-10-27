/** @import { SerializedFunctionCall, SerdeItem } from "./types.js" */

import { FunctionCall } from "@aztec/circuit-types";
import { FunctionType } from "@aztec/foundation/abi";

FunctionType;

// /**
//  * @typedef Serde
//  * @prop {SerdeItem<import("@aztec/aztec.js").FunctionCall, SerializedFunctionCall>} FunctionCall
//  */

// /**
//  * @type {Serde}
//  *
//  * @deprecated TODO: think of a better way to do this (serialize as a string using ClassConverter)
//  */
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

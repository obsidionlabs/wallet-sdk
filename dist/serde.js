/** @import { SerializedFunctionCall, SerdeItem } from "./types.js" */
/**
 * @typedef Serde
 * @prop {SerdeItem<import("@aztec/aztec.js").FunctionCall, SerializedFunctionCall>} FunctionCall
 */
/**
 * @type {Serde}
 *
 * @deprecated TODO: think of a better way to do this (serialize as a string using ClassConverter)
 */
export const serde = {
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
            const { Fr, AztecAddress, FunctionSelector } = await import("@aztec/aztec.js");
            return {
                selector: FunctionSelector.fromString(fc.selector),
                name: fc.name,
                type: /** @type {import('@aztec/foundation/abi').FunctionType} */ (fc.type),
                isStatic: fc.isStatic,
                to: AztecAddress.fromString(fc.to),
                args: fc.args.map((fr) => new Fr(BigInt(fr))),
                returnTypes: fc.returnTypes,
            };
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2VyZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsc0VBQXNFO0FBRXRFOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUc7SUFDbkIsWUFBWSxFQUFFO1FBQ1osU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQ2hDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSTtZQUNiLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSTtZQUNiLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTtZQUNyQixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDcEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDeEMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxXQUFXO1NBQzVCLENBQUM7UUFDRixXQUFXLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQ3hCLE1BQU0sRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsTUFBTSxNQUFNLENBQ3pELGlCQUFpQixDQUNsQixDQUFDO1lBQ0YsT0FBTztnQkFDTCxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2xELElBQUksRUFBRSxFQUFFLENBQUMsSUFBSTtnQkFDYixJQUFJLEVBQUUsMkRBQTJELENBQUMsQ0FDaEUsRUFBRSxDQUFDLElBQUksQ0FDUjtnQkFDRCxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVE7Z0JBQ3JCLEVBQUUsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLFdBQVcsRUFBRSxFQUFFLENBQUMsV0FBVzthQUM1QixDQUFDO1FBQ0osQ0FBQztLQUNGO0NBQ0YsQ0FBQyJ9
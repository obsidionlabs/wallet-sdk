export const OBSIDON_WALLET_URL = "http://localhost:5173";
/**
 * @template T
 * @param {() => T} fn
 */
export function lazyValue(fn) {
    /** @type T */
    let value;
    let initialized = false;
    return () => {
        if (!initialized) {
            initialized = true;
            value = fn();
        }
        return value;
    };
}
export async function accountFromCompleteAddress(provider, pxe, address) {
    const { AztecEip1193Account } = await import("./exports/eip1193.js");
    const nodeInfo = await pxe.getNodeInfo();
    return new AztecEip1193Account(address, provider, pxe, nodeInfo);
}
export function resolvePxe(getPxe) {
    const getPxe2 = lazyValue(typeof getPxe === "function" ? getPxe : () => getPxe);
    return lazyValue(async () => {
        const { waitForPXE } = await import("@aztec/aztec.js");
        const pxe = await getPxe2();
        await waitForPXE(pxe);
        return pxe;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsdUJBQXVCLENBQUM7QUFFMUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFNBQVMsQ0FBQyxFQUFhO0lBQ3RDLGNBQWM7SUFDZCxJQUFJLEtBQVUsQ0FBQztJQUNmLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztJQUN4QixPQUFPLEdBQUcsRUFBRTtRQUNYLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsQixXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25CLEtBQUssR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLDBCQUEwQixDQUMvQyxRQUE4QixFQUM5QixHQUFRLEVBQ1IsT0FBd0I7SUFFeEIsTUFBTSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUNyRSxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6QyxPQUFPLElBQUksbUJBQW1CLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsTUFBc0M7SUFDaEUsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUN4QixPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUNwRCxDQUFDO0lBQ0YsT0FBTyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDM0IsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkQsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLEVBQUUsQ0FBQztRQUM1QixNQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9
import { useEffect, useState } from "react";
import type { ObsidonWalletSDK } from "../popup.js";
import type { AztecEip1193Account } from "./eip1193.js";

export function useAccount(wallet: ObsidonWalletSDK) {
	const [account, setAccount] = useState<AztecEip1193Account | undefined>(
		undefined
	);

	useEffect(() => {
		const unsubscribe = wallet.accountObservable.subscribe((account) => {
			setAccount(account);
		});
		return () => unsubscribe();
	}, []);

	return account;
}

import { useEffect, useState } from "react";
import type { WalletWcSdk } from "../wc.js";
import type { Eip1193Account } from "./eip1193.js";
import type { WalletSdk } from './index.js';

export function useAccount(
	wallet: WalletSdk | WalletWcSdk
) {
	const [account, setAccount] = useState<Eip1193Account | undefined>(undefined);

	useEffect(() => {
		const unsubscribe = wallet.accountObservable.subscribe((account) => {
			setAccount(account);
		});
		return () => unsubscribe();
	}, []);

	return account;
}

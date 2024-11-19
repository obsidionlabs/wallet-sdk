// copied and adapted from CoinbaseWalletSdk: https://github.com/coinbase/coinbase-wallet-sdk/blob/bb531e34133fde40f53229966812b77a6e5a2626/packages/wallet-sdk/src/core/communicator/Communicator.ts
/**
 * Communicates with a wallet popup window for to send and receive messages.
 *
 * This class is responsible for opening a popup window, posting messages to it,
 * and listening for responses.
 *
 * It also handles cleanup of event listeners and the popup window itself when necessary.
 */
export class Communicator {
    constructor(params) {
        this.popup = null;
        this.listeners = new Map();
        this.nonPopupMethods = new Set(["aztec_accounts"]);
        /**
         * Posts a message to the popup window
         */
        this.postMessage = async (message) => {
            console.log("message in postMessage: ", message);
            const popup = await this.waitForPopupLoaded();
            console.log("popup: ", popup);
            console.log("this.url.origin: ", this.url.origin);
            popup.postMessage(message, this.url.origin);
        };
        // /**
        //  * Posts a request to the popup window and waits for a response
        //  */
        // postRequestAndWaitForResponse = async <M extends Message>(
        // 	request: Message
        // ): Promise<M> => {
        // 	console.log("postRequestAndWaitForResponse...");
        // 	console.log(
        // 		"request id in postRequestAndWaitForResponse: ",
        // 		request.requestId
        // 	);
        // 	if (
        // 		typeof request?.data === "object" &&
        // 		request?.data !== null &&
        // 		"method" in request.data
        // 	) {
        // 		console.log(
        // 			"request.data.method in postRequestAndWaitForResponse: ",
        // 			(request.data as { method: string }).method
        // 		);
        // 	}
        // 	console.log("request in postRequestAndWaitForResponse: ", request);
        // 	const responsePromise = this.onMessage<M>(
        // 		({ requestId }) => requestId === request.requestId
        // 	);
        // 	console.log("responsePromise: ", responsePromise);
        // 	await this.postMessage(request);
        // 	console.log("...postMessage in postRequestAndWaitForResponse");
        // 	return await responsePromise;
        // };
        this.postRequestAndWaitForResponse = async (request) => {
            console.log("postRequestAndWaitForResponse...");
            console.log("request id in postRequestAndWaitForResponse: ", request.requestId);
            let shouldOpenPopup = true;
            // Check if the method should bypass the popup
            if (typeof request?.data === "object" &&
                request?.data !== null &&
                "method" in request.data &&
                this.nonPopupMethods.has(request.data.method) // change1
            ) {
                console.log(`Method ${request.data.method} does not require popup.`);
                shouldOpenPopup = false; // change2
            }
            console.log("shouldOpenPopup: ", shouldOpenPopup); // change3
            const responsePromise = this.onMessage(({ requestId }) => requestId === request.requestId);
            console.log("responsePromise: ", responsePromise);
            if (shouldOpenPopup) {
                await this.postMessage(request);
            }
            else {
                console.log("Skipping popup for this request."); // change4
                window.postMessage(request, this.url.origin);
            }
            return await responsePromise;
        };
        /**
         * Listens for messages from the popup window that match a given predicate.
         */
        this.onMessage = async (predicate) => {
            console.log("onMessage...");
            return new Promise((resolve, reject) => {
                const listener = (event) => {
                    console.log("event in listener: ", event);
                    if (event.origin !== this.url.origin)
                        return; // origin validation
                    const message = event.data;
                    if (predicate(message)) {
                        resolve(message);
                        window.removeEventListener("message", listener);
                        this.listeners.delete(listener);
                    }
                };
                window.addEventListener("message", listener);
                this.listeners.set(listener, { reject });
            });
        };
        /**
         * Closes the popup, rejects all requests and clears the listeners
         */
        this.disconnect = () => {
            // Note: keys popup handles closing itself. this is a fallback.
            closePopup(this.popup);
            this.popup = null;
            if (this.popupCloseInterval != null) {
                clearInterval(this.popupCloseInterval);
                this.popupCloseInterval = undefined;
            }
            this.listeners.forEach(({ reject }, listener) => {
                reject(new Error("Request rejected"));
                window.removeEventListener("message", listener);
            });
            this.listeners.clear();
        };
        /**
         * Waits for the popup window to fully load and then sends a version message.
         */
        this.waitForPopupLoaded = async () => {
            console.log("waitForPopupLoaded...");
            if (this.popup && !this.popup.closed) {
                // In case the user un-focused the popup between requests, focus it again
                this.popup.focus();
                return this.popup;
            }
            console.log("waitForPopupLoaded: 1");
            this.popup = openPopup(this.url);
            if (!this.popup && this.fallbackOpenPopup) {
                console.log("failed to open, trying fallback");
                this.popup = await this.fallbackOpenPopup(() => openPopup(this.url));
            }
            console.log("waitForPopupLoaded: 2");
            if (!this.popup) {
                throw new Error("Failed to open popup: failed to load");
            }
            console.log("waitForPopupLoaded: 3");
            this.onMessage(({ event }) => event === "PopupUnload")
                .then(this.disconnect)
                .catch(() => { });
            console.log("waitForPopupLoaded: 4");
            if (this.popupCloseInterval == null) {
                this.popupCloseInterval = setInterval(() => {
                    if (!this.popup || this.popup.closed) {
                        this.disconnect();
                    }
                }, 100);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pingInterval = setInterval(() => {
                if (!this.popup || this.popup.closed) {
                    clearInterval(pingInterval);
                    return;
                }
                this.popup.postMessage({ event: "PopupLoadedRequest" }, this.url.origin);
            }, 100);
            try {
                console.log("waitForPopupLoaded: 5");
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const message = await this.onMessage(({ event }) => {
                    return event === "PopupLoaded";
                });
                console.log("message in waitForPopupLoaded: ", message);
                console.log("waitForPopupLoaded: 6");
            }
            finally {
                clearInterval(pingInterval);
            }
            // await this.postMessage({
            //   requestId: message.id,
            //   data: {
            //     version: VERSION,
            //     metadata: this.metadata,
            //     preference: this.preference,
            //   },
            // });
            return this.popup;
        };
        console.log("Communicator constructor...");
        this.url = new URL(params.url);
        console.log("this.url: ", this.url);
        this.fallbackOpenPopup = params.fallbackOpenPopup;
    }
}
const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 540;
// Window Management
export function openPopup(url) {
    console.log("openPopup...");
    const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
    const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;
    console.log("left: ", left);
    console.log("top: ", top);
    const popup = window.open(url, "Smart Wallet", `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`);
    popup?.focus();
    return popup;
}
export function closePopup(popup) {
    if (popup && !popup.closed) {
        popup.close();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxxTUFBcU07QUFFck07Ozs7Ozs7R0FPRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBY3hCLFlBQVksTUFHWDtRQWZPLFVBQUssR0FBa0IsSUFBSSxDQUFDO1FBQzVCLGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFHeEIsQ0FBQztRQU1JLG9CQUFlLEdBQWdCLElBQUksR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBWW5FOztXQUVHO1FBQ0gsZ0JBQVcsR0FBRyxLQUFLLEVBQUUsT0FBZ0IsRUFBRSxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUM7UUFFRixNQUFNO1FBQ04sa0VBQWtFO1FBQ2xFLE1BQU07UUFDTiw2REFBNkQ7UUFDN0Qsb0JBQW9CO1FBQ3BCLHFCQUFxQjtRQUNyQixvREFBb0Q7UUFDcEQsZ0JBQWdCO1FBQ2hCLHFEQUFxRDtRQUNyRCxzQkFBc0I7UUFDdEIsTUFBTTtRQUVOLFFBQVE7UUFDUix5Q0FBeUM7UUFDekMsOEJBQThCO1FBQzlCLDZCQUE2QjtRQUM3QixPQUFPO1FBQ1AsaUJBQWlCO1FBQ2pCLCtEQUErRDtRQUMvRCxpREFB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
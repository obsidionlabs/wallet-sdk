/**
 * Communicates with a wallet popup window for to send and receive messages.
 *
 * This class is responsible for opening a popup window, posting messages to it,
 * and listening for responses.
 *
 * It also handles cleanup of event listeners and the popup window itself when necessary.
 */
export declare class Communicator {
    private readonly url;
    private popup;
    private listeners;
    private popupCloseInterval;
    private fallbackOpenPopup;
    private nonPopupMethods;
    constructor(params: {
        url: string | URL;
        fallbackOpenPopup?: FallbackOpenPopup;
    });
    /**
     * Posts a message to the popup window
     */
    postMessage: (message: Message) => Promise<void>;
    postRequestAndWaitForResponse: <M extends Message>(request: Message) => Promise<M>;
    /**
     * Listens for messages from the popup window that match a given predicate.
     */
    onMessage: <M extends Message>(predicate: (_: Partial<M>) => boolean) => Promise<M>;
    /**
     * Closes the popup, rejects all requests and clears the listeners
     */
    disconnect: () => void;
    /**
     * Waits for the popup window to fully load and then sends a version message.
     */
    waitForPopupLoaded: () => Promise<Window>;
}
export declare function openPopup(url: URL): Window | null;
export declare function closePopup(popup: Window | null): void;
type Message = {
    requestId: string;
    data: unknown;
};
export interface ConfigMessage extends Message {
    event: ConfigEvent;
}
export type ConfigEvent = "PopupLoaded" | "PopupUnload";
export type FallbackOpenPopup = (openPopup: () => Window | null) => Promise<Window | null>;
export {};
//# sourceMappingURL=Communicator.d.ts.map
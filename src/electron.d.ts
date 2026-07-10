declare global {
  interface Window {
    electronAPI?: {
      openVideoDialog: () => Promise<string[]>;
    };
  }
}
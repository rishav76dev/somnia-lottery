import { createWalletClient, custom } from "viem";

export const wallet = () =>
  createWalletClient({
    transport: custom(window.ethereum),
  });

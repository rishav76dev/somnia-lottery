import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { somniaTestnet } from './somnia'

const account = privateKeyToAccount(process.env.PRIVATE_KEY )

export const walletClient = createWalletClient({
  account,
  chain: somniaTestnet,
  transport: http(process.env.RPC_URL),
})

export const serverAddress = account.address

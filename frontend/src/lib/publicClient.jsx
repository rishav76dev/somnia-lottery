import { createPublicClient, http } from 'viem'
import { somniaTestnet } from './somnia'

export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(process.env.RPC_URL),
})

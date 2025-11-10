import { WagmiConfig, createConfig } from 'wagmi'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { somniaTestnet } from '@/lib/chain'

const { wallets, connectors } = getDefaultWallets({
  appName: 'Somnia Lottery',
  projectId: 'SOMNIA-LOTTERY', // can be any string
})

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: undefined,
  chains: [somniaTestnet],
})

export function WalletProvider() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={[somniaTestnet]}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

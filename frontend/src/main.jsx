import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { somniaTestnet } from './lib/somnia'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const config = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http()
  }
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="bg-black min-h-screen">
            <div className="container mx-auto p-4">
              <div className="flex justify-end mb-4">
                <ConnectButton />
              </div>
              <App />
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)

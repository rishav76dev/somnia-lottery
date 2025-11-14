import { useEffect, useState } from 'react'
import { sdsClient } from '@/lib/somnia'
import { Address } from 'viem'
import { LOTTERY_CONTRACT_ADDRESS } from '@/lib/lotteryContract'

export interface LotteryStreamData {
  ticketsSold?: number
  pot?: string
  status?: 'open' | 'drawn' | 'expired'
  winner?: Address
  creatorProfit?: string
  payoutWinner?: string
  creator?: Address
  ticketPrice?: string
  prizeAmount?: string
  buyDeadline?: number
}

export interface WinnerAnnouncedEvent {
  id: number
  winner: Address
  payoutWinner: string
  creatorProfit: string
}

/**
 * Hook to subscribe to real-time lottery updates via Somnia Streams
 */
export function useLotteryStream(lotteryId: bigint | null) {
  const [streamData, setStreamData] = useState<LotteryStreamData | null>(null)
  const [lastEvent, setLastEvent] = useState<WinnerAnnouncedEvent | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!lotteryId) return

    let unsubscribeFunc: (() => void) | undefined

    const setupStream = async () => {
      try {
        // Subscribe to real-time updates using the correct Somnia Streams API
        const subscription = await sdsClient.subscribe({
          somniaStreamsEventId: `lottery:${lotteryId.toString()}`,
          ethCalls: [], // No eth calls needed for simple event listening
          onlyPushChanges: true,
          onData: (data: any) => {
            console.log('📡 Stream update received:', data)

            // Parse the data based on your worker's set() structure
            if (data && typeof data === 'object') {
              setStreamData(data as LotteryStreamData)
              setIsConnected(true)

              // Check for winner announcement events
              if (data.status === 'drawn' && data.winner) {
                setLastEvent({
                  id: Number(lotteryId),
                  winner: data.winner,
                  payoutWinner: data.payoutWinner || '0',
                  creatorProfit: data.creatorProfit || '0'
                })
              }
            }
          },
          onError: (error: Error) => {
            console.error('Stream error:', error)
            setIsConnected(false)
          }
        })

        if (subscription) {
          unsubscribeFunc = subscription.unsubscribe
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to setup Somnia Stream:', error)
        setIsConnected(false)
      }
    }

    setupStream()

    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc()
      }
      setIsConnected(false)
    }
  }, [lotteryId])

  return { streamData, lastEvent, isConnected }
}

/**
 * Hook to subscribe to creator profit updates
 */
export function useCreatorStream(creatorAddress: Address | undefined) {
  const [creatorProfit, setCreatorProfit] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!creatorAddress) return

    let unsubscribeFunc: (() => void) | undefined

    const setupStream = async () => {
      try {
        const subscription = await sdsClient.subscribe({
          somniaStreamsEventId: `creator:${creatorAddress}`,
          ethCalls: [],
          onlyPushChanges: true,
          onData: (data: any) => {
            if (data && typeof data === 'object' && 'creatorProfit' in data) {
              setCreatorProfit(data.creatorProfit as string)
            }
            setIsConnected(true)
          },
          onError: (error: Error) => {
            console.error('Creator stream error:', error)
            setIsConnected(false)
          }
        })

        if (subscription) {
          unsubscribeFunc = subscription.unsubscribe
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to setup creator stream:', error)
        setIsConnected(false)
      }
    }

    setupStream()

    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc()
      }
      setIsConnected(false)
    }
  }, [creatorAddress])

  return { creatorProfit, isConnected }
}

/**
 * Hook to get all lottery activities (global stream)
 */
export function useGlobalLotteryActivity() {
  const [activities, setActivities] = useState<Array<{
    type: string
    lotteryId: string
    data: any
    timestamp: number
  }>>([])

  useEffect(() => {
    let unsubscribeFunc: (() => void) | undefined

    const setupStream = async () => {
      try {
        const subscription = await sdsClient.subscribe({
          somniaStreamsEventId: 'lottery:global',
          ethCalls: [],
          onlyPushChanges: true,
          eventContractSources: [LOTTERY_CONTRACT_ADDRESS], // Listen to lottery contract events
          onData: (data: any) => {
            console.log('🌍 Global activity:', data)

            // Add activity to the list
            if (data && typeof data === 'object') {
              setActivities(prev => [
                {
                  type: data.eventName || 'update',
                  lotteryId: data.id?.toString() || 'unknown',
                  data: data,
                  timestamp: Date.now(),
                },
                ...prev.slice(0, 49), // Keep last 50 activities
              ])
            }
          },
          onError: (error: Error) => {
            console.error('Global stream error:', error)
          }
        })

        if (subscription) {
          unsubscribeFunc = subscription.unsubscribe
        }
      } catch (error) {
        console.error('Failed to setup global stream:', error)
      }
    }

    setupStream()

    return () => {
      if (unsubscribeFunc) {
        unsubscribeFunc()
      }
    }
  }, [])

  return { activities }
}

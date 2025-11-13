import { useEffect, useState } from 'react'
import { sdsClient } from '@/lib/somnia'
import { Address } from 'viem'

export interface LotteryStreamData {
  ticketsSold?: number
  pot?: string
  status?: 'open' | 'drawn' | 'expired'
  winner?: Address
  creatorProfit?: string
  payoutWinner?: string
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

    const streamKey = `lottery:${lotteryId.toString()}`
    let unsubscribe: (() => void) | undefined

    const setupStream = async () => {
      try {
        // Get initial state
        const initialData = await sdsClient.get(streamKey)
        if (initialData) {
          setStreamData(initialData as LotteryStreamData)
        }

        // Subscribe to real-time updates
        unsubscribe = await sdsClient.subscribe(
          streamKey,
          (data) => {
            console.log('📡 Stream update received:', data)
            setStreamData(data as LotteryStreamData)
            setIsConnected(true)
          },
          (event) => {
            // Handle custom events (e.g., WinnerAnnounced)
            console.log('🎉 Event received:', event)
            if (event.type === 'WinnerAnnounced') {
              setLastEvent(event.data as WinnerAnnouncedEvent)
            }
          }
        )

        setIsConnected(true)
      } catch (error) {
        console.error('Failed to setup Somnia Stream:', error)
        setIsConnected(false)
      }
    }

    setupStream()

    return () => {
      if (unsubscribe) {
        unsubscribe()
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

    const streamKey = `creator:${creatorAddress}`
    let unsubscribe: (() => void) | undefined

    const setupStream = async () => {
      try {
        // Get initial state
        const initialData = await sdsClient.get(streamKey)
        if (initialData && typeof initialData === 'object' && 'creatorProfit' in initialData) {
          setCreatorProfit((initialData as { creatorProfit: string }).creatorProfit)
        }

        // Subscribe to real-time updates
        unsubscribe = await sdsClient.subscribe(
          streamKey,
          (data) => {
            if (data && typeof data === 'object' && 'creatorProfit' in data) {
              setCreatorProfit((data as { creatorProfit: string }).creatorProfit)
            }
            setIsConnected(true)
          }
        )

        setIsConnected(true)
      } catch (error) {
        console.error('Failed to setup creator stream:', error)
        setIsConnected(false)
      }
    }

    setupStream()

    return () => {
      if (unsubscribe) {
        unsubscribe()
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
    const streamKey = 'lottery:global'
    let unsubscribe: (() => void) | undefined

    const setupStream = async () => {
      try {
        unsubscribe = await sdsClient.subscribe(
          streamKey,
          (data) => {
            // Handle global lottery updates
            console.log('🌍 Global activity:', data)
          },
          (event) => {
            // Handle global events
            setActivities(prev => [
              {
                type: event.type,
                lotteryId: event.data?.id || 'unknown',
                data: event.data,
                timestamp: Date.now(),
              },
              ...prev.slice(0, 49), // Keep last 50 activities
            ])
          }
        )
      } catch (error) {
        console.error('Failed to setup global stream:', error)
      }
    }

    setupStream()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return { activities }
}

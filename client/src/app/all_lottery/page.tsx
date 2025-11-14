'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLotteries, useLottery } from '@/hooks/useLotteries'
import { useGlobalLotteryActivity } from '@/hooks/useSomniaStreams'
import { LotteryCard } from '@/components/LotteryCard'
import { GlobalActivityTicker } from '@/components/GlobalActivityTicker'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function ParticipatePage() {
  const router = useRouter()
  const { lotteryCount, isLoading, refetch } = useLotteries()
  const { activities } = useGlobalLotteryActivity()
  const [filter, setFilter] = useState<'active' | 'ended' | 'all'>('active')
  const [refreshKey, setRefreshKey] = useState(0)

  // Refetch lottery count when new lottery is created from global stream
  useEffect(() => {
    if (activities.length > 0) {
      const latestActivity = activities[0]

      // Refetch when new lottery is created
      if (latestActivity.type === 'LotteryCreated') {
        refetch()
        setRefreshKey(prev => prev + 1) // Force re-render of lottery cards
      }

      // Refetch when lottery status changes (winner announced, expired)
      if (latestActivity.type === 'WinnerAnnounced' || latestActivity.type === 'LotteryExpired') {
        setRefreshKey(prev => prev + 1) // Force re-render to update status
      }
    }
  }, [activities, refetch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-white mb-6">
          🎟️ Participate in Lotteries
        </h1>

        {/* Global Activity Ticker */}
        <GlobalActivityTicker />

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            All
          </Button>
          <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>
            Active
          </Button>
          <Button variant={filter === 'ended' ? 'default' : 'outline'} onClick={() => setFilter('ended')}>
            Ended
          </Button>
        </div>

        {/* No lotteries */}
        {lotteryCount === 0 && (
          <div className="text-gray-300 text-center p-10 border border-purple-400/20 rounded-xl">
            No lotteries yet. Create one!
          </div>
        )}

        {/* Lottery List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: lotteryCount }, (_, i) => (
            <LotteryCardWrapper
              key={`${i}-${refreshKey}`}
              id={BigInt(i + 1)}
              filter={filter}
              onSelect={() => router.push(`/lottery/${i + 1}`)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

// Fetch individual lottery and apply filter
function LotteryCardWrapper({
  id,
  filter,
  onSelect,
}: {
  id: bigint
  filter: 'active' | 'ended' | 'all'
  onSelect: () => void
}) {
  const { lottery, isLoading, refetch } = useLottery(id)
  const { activities } = useGlobalLotteryActivity()

  // Refetch this specific lottery when its status changes via stream
  useEffect(() => {
    if (activities.length > 0) {
      const latestActivity = activities[0]
      const activityLotteryId = latestActivity.lotteryId

      // If this lottery's status changed, refetch its data
      if (
        activityLotteryId === id.toString() &&
        (latestActivity.type === 'WinnerAnnounced' ||
         latestActivity.type === 'LotteryExpired' ||
         latestActivity.type === 'TicketPurchased')
      ) {
        refetch()
      }
    }
  }, [activities, id, refetch])

  if (isLoading || !lottery) return null

  const now = Math.floor(Date.now() / 1000)
  const isActive =
    lottery.status === 0 && now <= lottery.buyDeadline // status 0 = Open
  const isEnded =
    lottery.status !== 0 || now > lottery.buyDeadline

  if (filter === 'active' && !isActive) return null
  if (filter === 'ended' && !isEnded) return null

  return <LotteryCard lottery={lottery} onClick={onSelect} />
}

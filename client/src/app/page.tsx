'use client'

import { useState } from 'react'
import { useLotteries, useLottery } from '@/hooks/useLotteries'
import { LotteryCard } from '@/components/LotteryCard'
import { LotteryDetails } from '@/components/LotteryDetails'
import { GlobalActivityTicker } from '@/components/GlobalActivityTicker'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Ticket } from 'lucide-react'
import { LotteryStatus } from '@/lib/lotteryContract'

export default function Home() {
  const { lotteryCount, isLoading } = useLotteries()
  const [selectedLotteryId, setSelectedLotteryId] = useState<bigint | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('active')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Active Lotteries
          </h1>
          <p className="text-gray-400 text-lg">
            Join a lottery and win big prizes on Somnia Network
          </p>
        </div>

        {/* Global Activity Ticker */}
        <GlobalActivityTicker />

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            All Lotteries
          </Button>
          <Button
            onClick={() => setFilter('active')}
            variant={filter === 'active' ? 'default' : 'outline'}
            className={filter === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            Active
          </Button>
          <Button
            onClick={() => setFilter('ended')}
            variant={filter === 'ended' ? 'default' : 'outline'}
            className={filter === 'ended' ? 'bg-gray-600 hover:bg-gray-700' : ''}
          >
            Ended
          </Button>
        </div>

        {/* Lotteries Grid */}
        {lotteryCount === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Ticket />
              </EmptyMedia>
              <EmptyTitle>No lotteries found</EmptyTitle>
              <EmptyDescription>
                Be the first to create a lottery and win big!
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: lotteryCount }, (_, i) => i + 1).map((id) => (
              <LotteryCardWrapper
                key={id}
                lotteryId={BigInt(id)}
                onClick={() => setSelectedLotteryId(BigInt(id))}
                filter={filter}
              />
            ))}
          </div>
        )}

        {/* Lottery Details Modal */}
        {selectedLotteryId && (
          <LotteryDetails
            lotteryId={selectedLotteryId}
            onClose={() => setSelectedLotteryId(null)}
          />
        )}
      </div>
    </div>
  )
}

// Wrapper component to fetch individual lottery data
function LotteryCardWrapper({
  lotteryId,
  onClick,
  filter
}: {
  lotteryId: bigint
  onClick: () => void
  filter: 'all' | 'active' | 'ended'
}) {
  const { lottery, isLoading } = useLottery(lotteryId)

  if (isLoading || !lottery) {
    return (
      <Card className="bg-purple-900/30 border-purple-500/30">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    )
  }

  // Filter logic - Fixed to properly show expired lotteries
  const now = Math.floor(Date.now() / 1000)

  // Active = Status is Open AND deadline has not passed
  const isActive = lottery.status === LotteryStatus.Open && now <= lottery.buyDeadline

  // Ended = Status is Drawn OR Expired OR deadline has passed (even if status is still Open)
  const isEnded =
    lottery.status === LotteryStatus.Drawn ||
    lottery.status === LotteryStatus.Expired ||
    now > lottery.buyDeadline

  if (filter === 'active' && !isActive) return null
  if (filter === 'ended' && !isEnded) return null

  return <LotteryCard lottery={lottery} onClick={onClick} />
}

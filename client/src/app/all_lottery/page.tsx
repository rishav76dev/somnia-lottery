'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLotteries, useLottery } from '@/hooks/useLotteries'
import { LotteryCard } from '@/components/LotteryCard'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function ParticipatePage() {
  const router = useRouter()
  const { lotteryCount, isLoading } = useLotteries()
  const [filter, setFilter] = useState<'active' | 'ended' | 'all'>('active')

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
              key={i}
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
  const { lottery, isLoading } = useLottery(id)

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

'use client'

import { formatEther } from 'viem'
import { LotteryInfo, LotteryStatus } from '@/lib/lotteryContract'
import { Card, CardHeader, CardContent } from './ui/card'
import { Ticket, Clock, Users, Trophy } from 'lucide-react'

export function LotteryCard({ lottery, onClick }: { lottery: LotteryInfo, onClick: () => void }) {
  const now = Math.floor(Date.now() / 1000)
  const ended = now > lottery.buyDeadline || lottery.status !== LotteryStatus.Open

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer bg-black/20 border border-purple-500/20 hover:bg-black/30 transition rounded-xl p-4 text-white"
    >
      <CardHeader>
        <h2 className="text-xl font-bold">Lottery #{lottery.id.toString()}</h2>
        <p className="text-gray-400">
          Prize: {formatEther(lottery.prizeAmount)} STT
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-blue-300">
          <Ticket className="w-4 h-4" /> {formatEther(lottery.ticketPrice)} STT / ticket
        </div>
        <div className="flex items-center gap-2 text-green-300">
          <Users className="w-4 h-4" /> {lottery.ticketsSold.toString()} participants
        </div>
        <div className="flex items-center gap-2 text-purple-300">
          <Trophy className="w-4 h-4" /> Pot: {formatEther(lottery.pot)} STT
        </div>
        <div className="flex items-center gap-2 text-yellow-300">
          <Clock className="w-4 h-4" />
          {ended ? 'Ended' : 'Active'}
        </div>
      </CardContent>
    </Card>
  )
}

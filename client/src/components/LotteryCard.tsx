'use client'

import { formatEther } from 'viem'
import { LotteryInfo, LotteryStatus } from '@/lib/lotteryContract'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Clock, Ticket, Trophy, Users } from 'lucide-react'

interface LotteryCardProps {
  lottery: LotteryInfo
  onClick: () => void
}

export function LotteryCard({ lottery, onClick }: LotteryCardProps) {
  const getStatusBadge = () => {
    const now = Math.floor(Date.now() / 1000)
    const isPastDeadline = now > lottery.buyDeadline

    if (lottery.status === LotteryStatus.Drawn) {
      return <Badge variant="default" className="bg-blue-600">Winner Drawn</Badge>
    }
    if (lottery.status === LotteryStatus.Expired || isPastDeadline) {
      return <Badge variant="secondary">Ended</Badge>
    }
    return <Badge variant="default" className="bg-green-600">Active</Badge>
  }

  const getTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = lottery.buyDeadline - now

    if (timeLeft <= 0) return 'Ended'

    const days = Math.floor(timeLeft / 86400)
    const hours = Math.floor((timeLeft % 86400) / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-white">Lottery #{lottery.id.toString()}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-gray-400">
          Prize: {formatEther(lottery.prizeAmount)} STT
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-blue-400">
            <Ticket className="w-4 h-4" />
            <span className="text-white">{formatEther(lottery.ticketPrice)} STT</span>
          </div>

          <div className="flex items-center gap-2 text-green-400">
            <Users className="w-4 h-4" />
            <span className="text-white">{lottery.ticketsSold.toString()}</span>
          </div>

          <div className="flex items-center gap-2 text-orange-400">
            <Clock className="w-4 h-4" />
            <span className="text-white">{getTimeRemaining()}</span>
          </div>

          <div className="flex items-center gap-2 text-purple-400">
            <Trophy className="w-4 h-4" />
            <span className="text-white">{formatEther(lottery.pot)} STT</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

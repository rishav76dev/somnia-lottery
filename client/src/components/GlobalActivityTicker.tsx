'use client'

import { useGlobalLotteryActivity } from '@/hooks/useSomniaStreams'
import { Activity, Trophy, Ticket, Timer } from 'lucide-react'

export function GlobalActivityTicker() {
  const { activities } = useGlobalLotteryActivity()

  if (activities.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <div className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
          Live
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {activities.slice(0, 5).map((activity, index) => (
          <ActivityRow key={`${activity.timestamp}-${index}`} activity={activity} />
        ))}
      </div>
    </div>
  )
}

function ActivityRow({ activity }: { activity: { type: string; lotteryId: string; timestamp: number; data: any } }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'WinnerAnnounced':
        return <Trophy className="w-4 h-4 text-yellow-400" />
      case 'TicketPurchased':
        return <Ticket className="w-4 h-4 text-blue-400" />
      default:
        return <Timer className="w-4 h-4 text-purple-400" />
    }
  }

  const getMessage = () => {
    switch (activity.type) {
      case 'WinnerAnnounced':
        return `🎉 Lottery #${activity.lotteryId} winner announced!`
      case 'TicketPurchased':
        return `🎫 Ticket purchased for Lottery #${activity.lotteryId}`
      default:
        return `Activity in Lottery #${activity.lotteryId}`
    }
  }

  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - activity.timestamp) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      {getIcon()}
      <span className="text-sm text-white flex-1">{getMessage()}</span>
      <span className="text-xs text-gray-400">{getTimeAgo()}</span>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { Activity, Trophy, Ticket, Clock } from 'lucide-react'
import { useLotteryStream, WinnerAnnouncedEvent } from '@/hooks/useSomniaStreams'

interface LiveActivityFeedProps {
  lotteryId: bigint
}

export function LiveActivityFeed({ lotteryId }: LiveActivityFeedProps) {
  const { streamData, lastEvent, isConnected } = useLotteryStream(lotteryId)
  const [activities, setActivities] = useState<Array<{
    type: 'ticket' | 'winner' | 'status'
    message: string
    timestamp: number
    data?: any
  }>>([])

  // Add new activities when stream updates
  useEffect(() => {
    if (streamData) {
      const newActivity = {
        type: 'ticket' as const,
        message: `${streamData.ticketsSold || 0} tickets sold • Pot: ${streamData.pot ? formatEther(BigInt(streamData.pot)) : '0'} STT`,
        timestamp: Date.now(),
        data: streamData,
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10
    }
  }, [streamData])

  // Add winner announcement
  useEffect(() => {
    if (lastEvent) {
      const newActivity = {
        type: 'winner' as const,
        message: `🎉 Winner announced! ${lastEvent.winner.slice(0, 6)}...${lastEvent.winner.slice(-4)}`,
        timestamp: Date.now(),
        data: lastEvent,
      }
      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }
  }, [lastEvent])

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Live Activity
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Waiting for activity...
          </p>
        ) : (
          activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))
        )}
      </div>

      {streamData && (
        <div className="mt-4 pt-4 border-t border-purple-500/20">
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Current Status:</span>
              <span className="text-white font-semibold capitalize">{streamData.status || 'unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Tickets:</span>
              <span className="text-white font-semibold">{streamData.ticketsSold || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Pot:</span>
              <span className="text-white font-semibold">
                {streamData.pot ? formatEther(BigInt(streamData.pot)) : '0'} STT
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityItem({ activity }: { activity: { type: string; message: string; timestamp: number } }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'ticket':
        return <Ticket className="w-4 h-4 text-blue-400" />
      case 'winner':
        return <Trophy className="w-4 h-4 text-yellow-400" />
      case 'status':
        return <Clock className="w-4 h-4 text-purple-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - activity.timestamp) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${
      activity.type === 'winner' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'
    }`}>
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white break-words">{activity.message}</p>
        <p className="text-xs text-gray-400 mt-1">{getTimeAgo()}</p>
      </div>
    </div>
  )
}

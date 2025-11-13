'use client'

import { useEffect, useState } from 'react'
import { formatEther, formatUnits, Address } from 'viem'
import { useReadContract, useAccount } from 'wagmi'
import { LotteryInfo, LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI, LotteryStatus } from '@/lib/lotteryContract'
import { Button } from './ui/button'
import { X, Trophy, Ticket, Clock, Users, Wallet, ExternalLink, Copy, Check } from 'lucide-react'
import { useBuyTicket } from '@/hooks/useBuyTicket'
import { LiveActivityFeed } from './LiveActivityFeed'

interface LotteryDetailsProps {
  lotteryId: bigint
  onClose: () => void
}

export function LotteryDetails({ lotteryId, onClose }: LotteryDetailsProps) {
  const [participants, setParticipants] = useState<Address[]>([])
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const { address: userAddress } = useAccount()
  const { buyTicket, isPending, isSuccess } = useBuyTicket()

  // Fetch lottery info
  const { data: lotteryData, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'lotteries',
    args: [lotteryId],
  })

  // Check if user has bought ticket
  const { data: hasBought } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'hasBoughtTicket',
    args: userAddress ? [lotteryId, userAddress] : undefined,
  })

  // Fetch all participants
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!lotteryData) return

      const ticketsSold = Number(lotteryData[5]) // ticketsSold
      const participantsList: Address[] = []

      // This is a workaround - in production you'd want to use events or a subgraph
      for (let i = 0; i < ticketsSold; i++) {
        try {
          const { data } = await fetch('/api/participant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lotteryId: lotteryId.toString(), index: i }),
          }).then(res => res.json())

          if (data) participantsList.push(data as Address)
        } catch (error) {
          console.error('Error fetching participant:', error)
        }
      }

      setParticipants(participantsList)
    }

    fetchParticipants()
  }, [lotteryData, lotteryId])

  // Refetch on successful purchase
  useEffect(() => {
    if (isSuccess) {
      refetch()
    }
  }, [isSuccess, refetch])

  if (!lotteryData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const [creator, ticketPrice, prizeAmount, buyDeadline, status, ticketsSold, pot, winner] = lotteryData

  const lottery: LotteryInfo = {
    id: lotteryId,
    creator: creator as Address,
    ticketPrice: ticketPrice as bigint,
    prizeAmount: prizeAmount as bigint,
    buyDeadline: Number(buyDeadline),
    status: status as LotteryStatus,
    ticketsSold: ticketsSold as bigint,
    pot: pot as bigint,
    winner: winner as Address,
  }

  const getStatusBadge = () => {
    switch (lottery.status) {
      case LotteryStatus.Open:
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-500/20 text-green-400">Active</span>
      case LotteryStatus.Drawn:
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-500/20 text-blue-400">Drawn</span>
      case LotteryStatus.Expired:
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-500/20 text-gray-400">Expired</span>
    }
  }

  const getTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = lottery.buyDeadline - now

    if (timeLeft <= 0) return 'Ended'

    const days = Math.floor(timeLeft / 86400)
    const hours = Math.floor((timeLeft % 86400) / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)
    const seconds = timeLeft % 60

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopiedAddress(addr)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatAddress = (addr: Address) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleBuyTicket = () => {
    buyTicket(lotteryId, lottery.ticketPrice)
  }

  const canBuyTicket =
    lottery.status === LotteryStatus.Open &&
    Math.floor(Date.now() / 1000) <= lottery.buyDeadline &&
    !hasBought &&
    userAddress

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Lottery #{lottery.id.toString()}</h2>
            {getStatusBadge()}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Prize Pool</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatEther(lottery.prizeAmount)} STT</div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Ticket className="w-5 h-5" />
                <span className="font-semibold">Ticket Price</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatEther(lottery.ticketPrice)} STT</div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Participants</span>
              </div>
              <div className="text-2xl font-bold text-white">{lottery.ticketsSold.toString()}</div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold text-white">{getTimeRemaining()}</div>
              <div className="text-sm text-gray-400 mt-1">
                Ends: {new Date(lottery.buyDeadline * 1000).toLocaleString()}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="font-semibold">Total Pot</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatEther(lottery.pot)} STT</div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
              <div className="text-sm text-gray-400 mb-1">Creator</div>
              <div className="flex items-center gap-2">
                <code className="text-white text-sm">{formatAddress(lottery.creator)}</code>
                <button onClick={() => copyAddress(lottery.creator)} className="text-gray-400 hover:text-white">
                  {copiedAddress === lottery.creator ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Info */}
        {lottery.status === LotteryStatus.Drawn && lottery.winner !== '0x0000000000000000000000000000000000000000' && (
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-4 border border-yellow-500/30 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-bold text-white">Winner</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-yellow-300 font-mono">{lottery.winner}</code>
              <button onClick={() => copyAddress(lottery.winner)} className="text-gray-400 hover:text-white">
                {copiedAddress === lottery.winner ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Buy Ticket Button */}
        {canBuyTicket && (
          <div className="mb-6">
            <Button
              onClick={handleBuyTicket}
              disabled={isPending}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 text-lg"
            >
              {isPending ? 'Processing...' : `Buy Ticket for ${formatEther(lottery.ticketPrice)} STT`}
            </Button>
            {hasBought && (
              <p className="text-center text-yellow-400 mt-2">You already have a ticket!</p>
            )}
          </div>
        )}

        {/* Live Activity Feed */}
        <div className="mb-6">
          <LiveActivityFeed lotteryId={lotteryId} />
        </div>

        {/* Participants List */}
        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants ({lottery.ticketsSold.toString()})
          </h3>

          {lottery.ticketsSold === BigInt(0) ? (
            <p className="text-gray-400 text-center py-4">No participants yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from({ length: Number(lottery.ticketsSold) }).map((_, index) => (
                <ParticipantRow
                  key={index}
                  lotteryId={lotteryId}
                  index={index}
                  isWinner={lottery.status === LotteryStatus.Drawn && participants[index] === lottery.winner}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component to fetch and display individual participant
function ParticipantRow({ lotteryId, index, isWinner }: { lotteryId: bigint; index: number; isWinner: boolean }) {
  const [copiedAddress, setCopiedAddress] = useState(false)

  const { data: participant } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'participants',
    args: [lotteryId, BigInt(index)],
  })

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const formatAddress = (addr: Address) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!participant) {
    return (
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <span className="text-gray-400">Loading...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isWinner ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
        <code className="text-white font-mono text-sm">{formatAddress(participant as Address)}</code>
        {isWinner && (
          <span className="px-2 py-1 text-xs font-bold bg-yellow-500 text-black rounded">WINNER</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => copyAddress(participant as Address)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <a
          href={`https://somnia-explorer.com/address/${participant}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

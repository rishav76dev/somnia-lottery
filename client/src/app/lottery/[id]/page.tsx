'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLottery } from '@/hooks/useLotteries'
import { useParticipants } from '@/hooks/useParticipants'
import { useBuyTicket } from '@/hooks/useBuyTicket'
import { useLotteryStream } from '@/hooks/useSomniaStreams'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Trophy, Ticket, Clock, Users, Loader2, X, PartyPopper } from 'lucide-react'
import { LiveActivityFeed } from '@/components/LiveActivityFeed'

export default function LotteryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { address } = useAccount()
  const lotteryId = BigInt(resolvedParams.id)

  // All hooks must be called before any conditional returns
  const { lottery, isLoading: isLoadingLottery, refetch: refetchLottery } = useLottery(lotteryId)
  const { streamData } = useLotteryStream(lotteryId)
  const { participants, isLoading: isLoadingParticipants } = useParticipants(lotteryId, lottery?.ticketsSold)
  const { buyTicket, isPending, isSuccess } = useBuyTicket()
  const [showWinnerPopup, setShowWinnerPopup] = useState(false)

  const now = Math.floor(Date.now() / 1000)
  const isClosed = lottery ? (lottery.status !== 0 || now > lottery.buyDeadline) : false
  const isActive = !isClosed
  const hasWinner = lottery ? lottery.winner !== '0x0000000000000000000000000000000000000000' : false

  // Refetch lottery data when stream updates (new tickets sold)
  useEffect(() => {
    if (streamData && streamData.ticketsSold !== undefined) {
      refetchLottery()
    }
  }, [streamData, refetchLottery])

  // Show winner popup when page loads if lottery has ended with a winner
  useEffect(() => {
    if (lottery && isClosed && hasWinner) {
      setShowWinnerPopup(true)
    }
  }, [lottery, isClosed, hasWinner])

  // Conditional renders after all hooks
  if (isLoadingLottery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!lottery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Lottery not found</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-white mb-8">
          <h1 className="text-5xl font-bold mb-4">🎟️ Lottery #{lottery.id.toString()}</h1>
          <div className="flex items-center gap-2 text-lg">
            <span className={`px-3 py-1 rounded-full ${isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
              {isActive ? '🟢 Active' : '🔴 Ended'}
            </span>
          </div>
        </div>

        {/* Winner Announcement Banner */}
        {isClosed && hasWinner && (
          <Card className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-yellow-500/50 mb-8 animate-pulse">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white mb-2">🎉 We Have a Winner! 🎉</h2>
              <p className="text-xl text-yellow-200 mb-4">
                Congratulations to the lucky winner!
              </p>
              <div className="bg-black/30 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-300 mb-1">Winner Address</p>
                <p className="text-lg font-mono text-yellow-400 break-all">{lottery.winner}</p>
              </div>
              {lottery.winner === address && (
                <div className="mt-4">
                  <span className="bg-green-600 text-white px-6 py-2 rounded-full text-lg font-bold">
                    🎊 YOU WON! 🎊
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Prize Amount Card */}
          <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span className="text-gray-300 text-sm">Prize Pool</span>
              </div>
              <p className="text-4xl font-bold text-white">{formatEther(lottery.prizeAmount)} STT</p>
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-gray-300 text-sm">Total Participants</span>
              </div>
              <p className="text-4xl font-bold text-white">{lottery.ticketsSold.toString()}</p>
            </CardContent>
          </Card>

          {/* Ticket Price Card */}
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-8 h-8 text-purple-400" />
                <span className="text-gray-300 text-sm">Ticket Price</span>
              </div>
              <p className="text-4xl font-bold text-white">{formatEther(lottery.ticketPrice)} STT</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="bg-black/30 border-purple-400/20 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Pot</p>
                <p className="text-2xl font-semibold">{formatEther(lottery.pot)} STT</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {isClosed ? 'Ended At' : 'Ends At'}
                </p>
                <p className="text-2xl font-semibold">
                  {new Date(lottery.buyDeadline * 1000).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Creator</p>
                <p className="text-sm font-mono">{lottery.creator}</p>
              </div>
              {hasWinner && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Winner 🏆</p>
                  <p className="text-sm font-mono text-green-400 break-all">{lottery.winner}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buy Ticket Section */}
        {isActive && address && (
          <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Join the Lottery!</h3>
                  <p className="text-gray-300">Buy a ticket for {formatEther(lottery.ticketPrice)} STT</p>
                </div>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isPending}
                  onClick={() => buyTicket(lotteryId, lottery.ticketPrice)}
                >
                  {isPending ? 'Processing...' : 'Buy Ticket'}
                </Button>
              </div>
              {isSuccess && (
                <p className="text-green-400 mt-4 text-center font-semibold">
                  ✅ Ticket Purchased Successfully!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {!address && isActive && (
          <Card className="bg-yellow-600/20 border-yellow-500/30 mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-yellow-300">Please connect your wallet to participate</p>
            </CardContent>
          </Card>
        )}

        {/* Live Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {/* Participants Table */}
            <Card className="bg-black/30 border-purple-400/20">
              <CardHeader>
                <h2 className="text-2xl font-bold text-white">
                  <Users className="w-6 h-6 inline mr-2" />
                  All Participants
                </h2>
              </CardHeader>
              <CardContent>
                {isLoadingParticipants ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No participants yet. Be the first to join!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-purple-400/20">
                          <TableHead className="text-purple-300">#</TableHead>
                          <TableHead className="text-purple-300">Wallet Address</TableHead>
                          <TableHead className="text-purple-300 text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map((participant: string, index: number) => (
                          <TableRow key={index} className="border-purple-400/10">
                            <TableCell className="text-white font-medium">{index + 1}</TableCell>
                            <TableCell className="text-white font-mono">
                              {participant}
                              {participant === address && (
                                <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">You</span>
                              )}
                              {participant === lottery.winner && hasWinner && (
                                <span className="ml-2 text-xs bg-yellow-600 px-2 py-1 rounded">🏆 Winner</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-green-400">✓ Entered</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Live Stream Updates */}
            <LiveActivityFeed lotteryId={lotteryId} />
          </div>
        </div>
      </div>

      {/* Winner Announcement Popup */}
      {showWinnerPopup && isClosed && hasWinner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-2 border-yellow-500/50 rounded-2xl p-8 w-full max-w-md text-white relative animate-bounce-slow">
            <button
              onClick={() => setShowWinnerPopup(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mb-6 relative">
                <Trophy className="w-24 h-24 mx-auto text-yellow-400 animate-pulse" />
                <PartyPopper className="w-12 h-12 absolute top-0 left-1/4 text-pink-400 animate-spin-slow" />
                <PartyPopper className="w-12 h-12 absolute top-0 right-1/4 text-blue-400 animate-spin-slow" />
              </div>

              <h2 className="text-4xl font-bold mb-4 text-yellow-400">
                🎉 WINNER ANNOUNCED! 🎉
              </h2>

              <p className="text-xl mb-6 text-white">
                Lottery #{lottery.id.toString()} has ended!
              </p>

              <div className="bg-black/40 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-300 mb-2">The Lucky Winner:</p>
                <p className="text-lg font-mono text-yellow-400 break-all mb-4">
                  {lottery.winner}
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Prize Won</p>
                    <p className="text-xl font-bold text-green-400">
                      {formatEther(lottery.prizeAmount)} STT
                    </p>
                  </div>
                  <div className="border-l border-gray-600 pl-4">
                    <p className="text-gray-400">Total Participants</p>
                    <p className="text-xl font-bold text-blue-400">
                      {lottery.ticketsSold.toString()}
                    </p>
                  </div>
                </div>
              </div>

              {lottery.winner === address && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 animate-pulse">
                    <p className="text-2xl font-bold">🎊 CONGRATULATIONS! 🎊</p>
                    <p className="text-lg mt-2">YOU ARE THE WINNER!</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowWinnerPopup(false)}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
                size="lg"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

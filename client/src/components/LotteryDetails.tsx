'use client'

import { useReadContract, useAccount } from 'wagmi'
import { LotteryInfo, LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS } from '@/lib/lotteryContract'
import { Address, formatEther } from 'viem'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { useBuyTicket } from '@/hooks/useBuyTicket'

export function LotteryDetailsModal({
  lotteryId,
  onClose,
}: {
  lotteryId: bigint
  onClose: () => void
}) {
  const { address } = useAccount()

  const { data } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'lotteries',
    args: [lotteryId],
  })

  const { buyTicket, isPending, isSuccess } = useBuyTicket()

  if (!data) return null

  const [creator, ticketPrice, prizeAmount, buyDeadline, status, ticketsSold, pot, winner] = data

  const lottery: LotteryInfo = {
    id: lotteryId,
    creator: creator as Address,
    ticketPrice: ticketPrice as bigint,
    prizeAmount: prizeAmount as bigint,
    buyDeadline: Number(buyDeadline),
    status,
    ticketsSold: ticketsSold as bigint,
    pot: pot as bigint,
    winner: winner as Address,
  }

  const isClosed =
    lottery.status !== 0 || // not Open
    Math.floor(Date.now() / 1000) > lottery.buyDeadline

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-black/30 border border-purple-400/20 rounded-xl p-6 w-full max-w-lg text-white backdrop-blur-lg">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-2">Lottery #{lottery.id.toString()}</h2>
        <p className="text-gray-300 mb-6">
          Prize: {formatEther(lottery.prizeAmount)} STT
        </p>

        <div className="space-y-3">
          <p><b>Ticket Price:</b> {formatEther(lottery.ticketPrice)} STT</p>
          <p><b>Participants:</b> {lottery.ticketsSold.toString()}</p>
          <p><b>Pot:</b> {formatEther(lottery.pot)} STT</p>
          <p><b>Ends:</b> {new Date(lottery.buyDeadline * 1000).toLocaleString()}</p>
        </div>

        {/* Buy Ticket */}
        {!isClosed && address && (
          <Button
            className="w-full mt-6 bg-green-600 hover:bg-green-700"
            disabled={isPending}
            onClick={() => buyTicket(lotteryId, lottery.ticketPrice)}
          >
            {isPending ? 'Processing...' : `Buy Ticket`}
          </Button>
        )}

        {isSuccess && (
          <p className="text-green-400 text-center mt-3">Ticket Purchased!</p>
        )}

      </div>
    </div>
  )
}

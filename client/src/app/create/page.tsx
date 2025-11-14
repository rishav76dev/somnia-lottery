'use client'

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LOTTERY_ABI, LOTTERY_CONTRACT_ADDRESS } from '@/lib/lotteryContract'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { formatEther } from 'viem'

export default function CreateLotteryPage() {
  const [ticketPrice, setTicketPrice] = useState('')
  const [prizeAmount, setPrizeAmount] = useState('')
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const createLottery = () => {
    if (!ticketPrice || !prizeAmount) return

    const buyDeadline = Math.floor(Date.now() / 1000) + deadlineMinutes * 60

    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS,
      abi: LOTTERY_ABI,
      functionName: 'createLottery',
      args: [
        BigInt(ticketPrice),
        BigInt(prizeAmount),
        buyDeadline
      ],
      value: BigInt(prizeAmount) // must fund prize
    })
  }

  return (
    <main className="min-h-screen pt-24 max-w-xl mx-auto p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">Create a Lottery 🎟️</h1>

      <p className="text-gray-300 mb-6">
        Fill in details to launch your own decentralized lottery.
        Once created, your lottery will appear instantly thanks to **Somnia Streams**.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block mb-2 text-sm text-gray-400">Ticket Price (wei)</label>
          <input
            type="number"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            className="w-full p-3 rounded bg-black/30 border border-purple-500/30"
            placeholder="10000000000000000"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-400">Prize Amount (wei)</label>
          <input
            type="number"
            value={prizeAmount}
            onChange={(e) => setPrizeAmount(e.target.value)}
            className="w-full p-3 rounded bg-black/30 border border-purple-500/30"
            placeholder="20000000000000000"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-400">Duration (minutes)</label>
          <input
            type="number"
            value={deadlineMinutes}
            onChange={(e) => setDeadlineMinutes(Number(e.target.value))}
            className="w-full p-3 rounded bg-black/30 border border-purple-500/30"
            placeholder="10"
          />
        </div>

        <Button
          onClick={createLottery}
          disabled={isPending || confirming}
          className="w-full bg-purple-600 hover:bg-purple-700 py-4 text-lg"
        >
          {isPending || confirming ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Lottery'
          )}
        </Button>

        {isSuccess && (
          <p className="text-green-400 text-center mt-4">
            Lottery created! 🎉<br />
            It will appear in the list automatically via Streams.
          </p>
        )}

        {error && (
          <p className="text-red-500 text-center mt-4">{error.message}</p>
        )}
      </div>
    </main>
  )
}

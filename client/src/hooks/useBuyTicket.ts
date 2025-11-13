import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI } from '@/lib/lotteryContract'

export function useBuyTicket() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const buyTicket = (lotteryId: bigint, ticketPrice: bigint) => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS,
      abi: LOTTERY_ABI,
      functionName: 'buyTicket',
      args: [lotteryId],
      value: ticketPrice,
    })
  }

  return {
    buyTicket,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

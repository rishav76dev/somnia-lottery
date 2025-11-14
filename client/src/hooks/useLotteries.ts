import { useReadContract } from 'wagmi'
import { LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI, LotteryInfo, LotteryStatus } from '@/lib/lotteryContract'
import { Address } from 'viem'

export function useLotteries() {
  // Get total lottery count
  const { data: lotteryCount, isLoading: isLoadingCount, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'lotteryCount',
  })

  return {
    lotteryCount: lotteryCount ? Number(lotteryCount) : 0,
    isLoading: isLoadingCount,
    refetch,
  }
}

export function useLottery(lotteryId: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'lotteries',
    args: [lotteryId],
  })

  if (!data) {
    return { lottery: null, isLoading, refetch }
  }

  const [creator, ticketPrice, prizeAmount, buyDeadline, status, ticketsSold, pot, winner] = data

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

  return { lottery, isLoading, refetch }
}

import { useReadContracts } from 'wagmi'
import { LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI } from '@/lib/lotteryContract'
import { Address } from 'viem'

export function useParticipants(lotteryId: bigint, ticketsSold?: bigint) {
  const participantCount = ticketsSold ? Number(ticketsSold) : 0

  // Create array of contract calls for all participants
  const contracts = Array.from({ length: participantCount }, (_, i) => ({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'participants' as const,
    args: [lotteryId, BigInt(i)],
  }))

  const { data, isLoading } = useReadContracts({
    contracts,
  })

  // Extract participants from results
  const participants: Address[] = data
    ? data
        .filter((result) => result.status === 'success')
        .map((result) => result.result as Address)
    : []

  return {
    participants,
    isLoading,
  }
}

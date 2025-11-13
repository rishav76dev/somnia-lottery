import { Address } from 'viem'

// Replace with your deployed contract address
export const LOTTERY_CONTRACT_ADDRESS = '0xbAE565eA137FeF32217B78F06f9CA9f0BF17021d' as Address

export const LOTTERY_ABI = [
[
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_feeRecipient",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "buyTicket",
      "inputs": [
        { "name": "id", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "createLottery",
      "inputs": [
        { "name": "ticketPrice", "type": "uint256", "internalType": "uint256" },
        { "name": "prizeAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "buyDeadline", "type": "uint40", "internalType": "uint40" }
      ],
      "outputs": [
        { "name": "id", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "drawWinner",
      "inputs": [
        { "name": "id", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "feeRecipient",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasBoughtTicket",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "lotteries",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "creator", "type": "address", "internalType": "address" },
        { "name": "ticketPrice", "type": "uint256", "internalType": "uint256" },
        { "name": "prizeAmount", "type": "uint256", "internalType": "uint256" },
        { "name": "buyDeadline", "type": "uint40", "internalType": "uint40" },
        {
          "name": "status",
          "type": "uint8",
          "internalType": "enum Lottery.Status"
        },
        { "name": "ticketsSold", "type": "uint64", "internalType": "uint64" },
        { "name": "pot", "type": "uint256", "internalType": "uint256" },
        { "name": "winner", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "lotteryCount",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "participants",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pendingCreatorProfit",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pendingWithdrawals",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "platformFeeBps",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint16", "internalType": "uint16" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "withdraw",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawProfit",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "LotteryCreated",
      "inputs": [
        {
          "name": "id",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "ticketPrice",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "prizeAmount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "buyDeadline",
          "type": "uint40",
          "indexed": false,
          "internalType": "uint40"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "LotteryDrawn",
      "inputs": [
        {
          "name": "id",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "winner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "payoutWinner",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "totalProfit",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "LotteryExpired",
      "inputs": [
        {
          "name": "id",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "prizeReturnedToCreator",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ProfitWithdrawn",
      "inputs": [
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "creatorCut",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "platformCut",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TicketPurchased",
      "inputs": [
        {
          "name": "id",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "buyer",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "quantity",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newTicketsSold",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "newPot",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Withdrawal",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    }
  ]

] as const

export enum LotteryStatus {
  Open = 0,
  Drawn = 1,
  Expired = 2,
}

export interface LotteryInfo {
  id: bigint
  creator: Address
  ticketPrice: bigint
  prizeAmount: bigint
  buyDeadline: number
  status: LotteryStatus
  ticketsSold: bigint
  pot: bigint
  winner: Address
}

import "dotenv/config";
import { SDK } from "@somnia-chain/streams";
import { createPublicClient, http } from "viem";
import abi from "./abi/Lottery.json" with { type: "json" };

const RPC = process.env.SOMNIA_RPC;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const client = createPublicClient({
  transport: http(RPC)
});

const sdk = new SDK({
  public: client
});

// ---- TICKET PURCHASED ----
client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi,
  eventName: "TicketPurchased",
  onLogs: async (logs) => {
    for (const log of logs) {
      const { id, buyer, newTicketsSold, newPot } = log.args;

      // Update lottery-specific stream
      await sdk.streams.set(`lottery:${id}`, {
        ticketsSold: Number(newTicketsSold),
        pot: newPot.toString(),
        status: "open"
      });

      // Broadcast to global activity stream
      await sdk.streams.emitEvents(
        `lottery:global`,
        {},
        "TicketPurchased",
        {
          id: Number(id),
          buyer,
          ticketsSold: Number(newTicketsSold),
          pot: newPot.toString()
        }
      );

      console.log(`🎟️ Ticket Purchased → Lottery ${id} | Total Sold: ${newTicketsSold} | Buyer: ${buyer}`);
    }
  }
});

// ---- LOTTERY DRAWN ----
client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi,
  eventName: "LotteryDrawn",
  onLogs: async (logs) => {
    for (const log of logs) {
      const { id, winner, payoutWinner, totalProfit } = log.args;

      // Update lottery-specific stream and emit event
      await sdk.streams.emitEvents(
        `lottery:${id}`,
        {
          status: "drawn",
          winner,
          creatorProfit: totalProfit.toString(),
          payoutWinner: payoutWinner.toString()
        },
        "WinnerAnnounced",
        {
          id: Number(id),
          winner,
          payoutWinner: payoutWinner.toString(),
          creatorProfit: totalProfit.toString()
        }
      );

      // Broadcast to global activity stream
      await sdk.streams.emitEvents(
        `lottery:global`,
        {},
        "WinnerAnnounced",
        {
          id: Number(id),
          winner,
          payoutWinner: payoutWinner.toString()
        }
      );

      console.log(`🏆 Winner Drawn → Lottery ${id} | Winner: ${winner}`);
    }
  }
});


// ---- LOTTERY EXPIRED ----
client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi,
  eventName: "LotteryExpired",
  onLogs: async (logs) => {
    for (const log of logs) {
      const { id } = log.args;

      await sdk.streams.set(`lottery:${id}`, { status: "expired" });

      console.log(`⏳ Lottery Expired → Lottery ${id}`);
    }
  }
});

// ---- WINNER WITHDRAW ----
client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi,
  eventName: "Withdrawal",
  onLogs: async (logs) => {
    for (const log of logs) {
      const { user } = log.args;
      console.log(`💰 Withdrawal Claimed → ${user}`);
    }
  }
});

// ---- PROFIT WITHDRAW ----
client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi,
  eventName: "ProfitWithdrawn",
  onLogs: async (logs) => {
    for (const log of logs) {
      const { creator } = log.args;

      await sdk.streams.set(`creator:${creator}`, { creatorProfit: "0" });

      console.log(`🏦 Profit Withdrawn → Creator ${creator}`);
    }
  }
});

console.log("✅ Somnia SDS Worker is running...");

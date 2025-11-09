// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    // ---- GLOBAL PLATFORM CONFIG ----
    address public feeRecipient;
    uint16 public constant platformFeeBps = 500; // 5%
    uint256 public lotteryCount;

    enum Status { Open, Drawn, Expired }

    struct LotteryInfo {
        address creator;
        uint256 ticketPrice;
        uint256 prizeAmount;
        uint40 buyDeadline;
        Status status;
        uint64 ticketsSold;
        uint256 pot;
        address winner;
    }

    mapping(uint256 => LotteryInfo) public lotteries;
    mapping(uint256 => address[]) public participants;
    mapping(uint256 => mapping(address => bool)) public hasBoughtTicket;

    // RENAMED: For winner prizes and refunds
    mapping(address => uint256) public pendingWithdrawals;
    // NEW: Tracks total profit owed to a creator
    mapping(address => uint256) public pendingCreatorProfit;

    // ---- EVENTS ----
    event LotteryCreated(
        uint256 indexed id,
        address indexed creator,
        uint256 ticketPrice,
        uint256 prizeAmount,
        uint40 buyDeadline
    );

    event TicketPurchased(uint256 indexed id, address indexed buyer, uint256 quantity, uint256 newTicketsSold, uint256 newPot);
    event LotteryDrawn(uint256 indexed id, address indexed winner, uint256 payoutWinner, uint256 totalProfit); // Changed
    event LotteryExpired(uint256 indexed id, uint256 prizeReturnedToCreator);
    event Withdrawal(address indexed user, uint256 amount);
    // NEW: For the profit withdrawal
    event ProfitWithdrawn(address indexed creator, uint256 creatorCut, uint256 platformCut);


    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "no zero addr");
        feeRecipient = _feeRecipient;
    }

    // ---- CREATE LOTTERY ----
    function createLottery(
        uint256 ticketPrice,
        uint256 prizeAmount,
        uint40 buyDeadline
    ) external payable returns (uint256 id) {
        require(ticketPrice > 0, "price=0");
        require(prizeAmount > 0, "prize=0");
        require(buyDeadline > block.timestamp, "deadline in past");
        require(msg.value == prizeAmount, "must fund prize");
        require(ticketPrice * 10 <= prizeAmount, "ticket price max 10% of prize");

        id = ++lotteryCount;

        lotteries[id] = LotteryInfo({
            creator: msg.sender,
            ticketPrice: ticketPrice,
            prizeAmount: prizeAmount,
            buyDeadline: buyDeadline,
            status: Status.Open,
            ticketsSold: 0,
            pot: prizeAmount,
            winner: address(0)
        });

        emit LotteryCreated(id, msg.sender, ticketPrice, prizeAmount, buyDeadline);
    }

    // ---- BUY TICKET ----
    function buyTicket(uint256 id) external payable {
        LotteryInfo storage L = lotteries[id];
        require(L.status == Status.Open, "not open");
        require(block.timestamp <= L.buyDeadline, "deadline passed");
        require(!hasBoughtTicket[id][msg.sender], "already bought");
        require(msg.value == L.ticketPrice, "bad value");

        participants[id].push(msg.sender);
        hasBoughtTicket[id][msg.sender] = true;
        L.ticketsSold += 1;
        L.pot += msg.value;

        emit TicketPurchased(id, msg.sender, 1, L.ticketsSold, L.pot);
    }

    // ---- DRAW WINNER ----
    // This function no longer calculates fees.
    function drawWinner(uint256 id) external {
        LotteryInfo storage L = lotteries[id];
        require(L.status == Status.Open, "not open");
        require(block.timestamp > L.buyDeadline, "not ended");

        L.status = Status.Drawn;

        // Handle no-ticket-sold scenario
        if (L.ticketsSold == 0) {
            L.status = Status.Expired;
            // Add refund to creator's *prize* withdrawal balance
            pendingWithdrawals[L.creator] += L.prizeAmount;
            emit LotteryExpired(id, L.prizeAmount);
            return;
        }

        // --- Normal Draw Logic ---
        uint256 rand = uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, id, L.ticketsSold)));
        uint256 winnerIndex = rand % L.ticketsSold;
        address winner = participants[id][winnerIndex];
        L.winner = winner;

        // --- Payout Calculation ---
        uint256 winnerPayout = L.prizeAmount;
        uint256 totalProfit = L.pot - L.prizeAmount;

        // --- Assign Payouts ---
        // Add prize to the winner's claimable balance
        if (winnerPayout > 0) {
            pendingWithdrawals[winner] += winnerPayout;
        }
        // Add TOTAL profit to the creator's profit balance
        if (totalProfit > 0) {
            pendingCreatorProfit[L.creator] += totalProfit;
        }

        emit LotteryDrawn(id, winner, winnerPayout, totalProfit);
    }

    // ---- WITHDRAW (For Winners & Refunds) ----
    // This function is only for winners claiming their prize
    // or creators claiming their refund from an expired lottery.
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }

    // ---- NEW: WITHDRAW PROFIT (For Creators) ----
    // This function is for creators to claim their profit.
    // It will automatically send the platform fee.
    function withdrawProfit() external {
        uint256 totalProfit = pendingCreatorProfit[msg.sender];
        require(totalProfit > 0, "nothing to withdraw");

        // Set to zero *before* transfer
        pendingCreatorProfit[msg.sender] = 0;

        // Calculate split
        uint256 platformCut = (totalProfit * platformFeeBps) / 10000;
        uint256 creatorCut = totalProfit - platformCut;

        // --- PUSH PAYMENTS (RISKY) ---
        // Pay platform
        if (platformCut > 0) {
            payable(feeRecipient).transfer(platformCut);
        }
        // Pay creator
        if (creatorCut > 0) {
            payable(msg.sender).transfer(creatorCut);
        }

        emit ProfitWithdrawn(msg.sender, creatorCut, platformCut);
    }
}

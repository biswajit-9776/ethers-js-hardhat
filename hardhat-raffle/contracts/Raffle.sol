// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";
error Raffle__NotEnoughETHSent();
error Raffle__NotOpen();

contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }
    uint256 private immutable i_entranceFee;
    bytes32 private s_keyHash;
    uint256 private i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    bytes private s_extraArgs;

    address payable[] s_players;
    address private s_recentWinner;
    uint256 private randomWord;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    event RaffleEnter(address indexed sender);
    event WinnerPicked(address indexed winner);
    error Raffle__TransferFailed();

    constructor(
        uint256 entranceFee,
        bytes32 keyHash,
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        address _vrfCoordinator,
        uint256 interval
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        s_keyHash = keyHash;
        i_entranceFee = entranceFee;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHSent();
        }
        if (s_raffleState == RaffleState.CALCULATING) {
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev The Chainlink Keeper nodes call this function
     * they look for the upkeepNeeded to return true.
     * The following should be satisfied in order for it to be true:
     * 1. Our time interval should have passed.
     * 2. The lottery should have atleast 1 player and some ETH.
     * 3. Our subscription is funded with LINK.
     * 4. The lottery should be in an "open" state i.e, when a new winner is being
     * selected, no new players are allowed to join
     */
    function checkUpkeep(
        bytes calldata /*checkData*/
    ) external view returns (bool upkeepNeeded, bytes memory /*performData*/) {
        bool isOpen = (s_raffleState == RaffleState.OPEN);
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool hasEnoughPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        return ((isOpen && timePassed && hasEnoughPlayers && hasBalance), "");
    }

    function performUpkeep(bytes calldata /*performData*/) external {
        s_raffleState = RaffleState.CALCULATING;
        s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: s_extraArgs
            })
        );
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] calldata randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        s_recentWinner = s_players[indexOfWinner];
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = payable(s_recentWinner).call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(s_recentWinner);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    // This can be pure as constant variables are stored in bytecode and not in storage.
    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimestamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getLatestConfirmations() public pure returns (uint16) {
        return REQUEST_CONFIRMATIONS;
    }

    function  getInterval() public view returns (uint256) {
        return i_interval;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
// Uncomment this line to use console.log
// import "hardhat/console.sol";
error Eaffle__NotEnoughETHSent();

abstract contract Raffle is VRFConsumerBaseV2Plus {
    uint256 private immutable i_entranceFee;
    bytes32 private s_keyHash;
    uint256 private i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private callbackGasLimit;
    uint32 private s_numWords;

    address payable[] s_players;
    uint256 private randomWord;
    uint32 private constant NUMBER_OF_WORDS = 2;

    event RaffleEnter(address indexed sender);

    constructor(
        uint256 entranceFee,
        bytes32 keyHash,
        uint256 i_subscriptionId,
        address _vrfCoordinator
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        s_keyHash = keyHash;
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Eaffle__NotEnoughETHSent();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function pickWinner() public {}

    function requestRandomWinner() external {
        s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest{
                keyHash: s_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATION,
                callbackGasLimit: callbackGasLimit,
                numWords: s_numWords
            }
        );
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        randomWord = randomWords[0];
        randomWord = randomWord % s_players.length;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;

    address public immutable i_owner;
    address[] public fundedList;
    uint256 public constant USD_MINIMUM = 50 * 1e18;

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        require(msg.value.getConversionRate() >= USD_MINIMUM, "Not enough funds");
        fundedList.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        // payable(msg.sender).transfer(address(this).balance);

        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Unable to withdraw funds");

        (bool sendSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(sendSuccess, "Error occured in withdrawing funds");
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Only owner can withdraw");
        _;
    }
} 

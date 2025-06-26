// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    AggregatorV3Interface public priceFeed;
    address public immutable i_owner;
    address[] public fundedList;
    mapping(address => uint256) public addressToAmountFunded;
    uint256 public constant USD_MINIMUM = 50 * 1e18;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Only owner can withdraw");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address prideFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(prideFeedAddress);
    }

    // In Solidity, a function marked as external:
    // Can be called from outside the contract (e.g., by a transaction or another contract).
    // Cannot be called internally from within the same contract without this. or address(this).call().
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= USD_MINIMUM,
            "Not enough funds"
        );
        fundedList.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // payable(msg.sender).transfer(address(this).balance);

        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Unable to withdraw funds");

        (bool sendSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(sendSuccess, "Error occured in withdrawing funds");
    }

    function getVersion() public view returns (uint256) {
        return PriceConverter.getVersion(priceFeed);
    }
}

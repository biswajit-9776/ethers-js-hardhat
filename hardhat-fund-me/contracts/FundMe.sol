// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    AggregatorV3Interface private s_priceFeed;
    address private immutable i_owner;
    address[] public s_fundedList;
    mapping(address => uint256) private s_addressToAmountFunded;
    uint256 public constant USD_MINIMUM = 50 * 1e18;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Only owner can withdraw");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address prideFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(prideFeedAddress);
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
            msg.value.getConversionRate(s_priceFeed) >= USD_MINIMUM,
            "Not enough funds"
        );
        s_fundedList.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // payable(msg.sender).transfer(address(this).balance);

        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Unable to withdraw funds");

        (bool sendSuccess, ) = i_owner.call{
            value: address(this).balance
        }("");
        require(sendSuccess, "Error occured in withdrawing funds");

        for (
            uint256 funderIndex = 0;
            funderIndex < s_fundedList.length;
            funderIndex++
        ) {
            s_addressToAmountFunded[s_fundedList[funderIndex]] = 0;
        }
        s_fundedList = new address[](0);
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_fundedList;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            s_addressToAmountFunded[funders[funderIndex]] = 0;
        }
        s_fundedList = new address[](0);

        // payable(msg.sender).transfer(address(this).balance);

        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Unable to withdraw funds");

        (bool sendSuccess, ) = i_owner.call{
            value: address(this).balance
        }("");
        require(sendSuccess, "Error occured in withdrawing funds");

    }

    function getVersion() public view returns (uint256) {
        return PriceConverter.getVersion(s_priceFeed);
    }
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
    function getOwner() public view returns (address) {
        return i_owner;
    }
    function getAddressToAmountFunded(address key) public view returns (uint256) {
        return s_addressToAmountFunded[key];
    }
    function getFundersList(uint256 value) public view returns (address){
        return s_fundedList[value];
    }
}

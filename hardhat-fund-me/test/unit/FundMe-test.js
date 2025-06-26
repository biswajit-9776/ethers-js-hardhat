const { getContractFactory } = require("@nomicfoundation/hardhat-ethers/types")
const { expect } = require("chai")
const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA } = require("hardhat/builtin-tasks/task-names")

const SEND_VALUE = ethers.parseEther("1")
describe("Test FundMe Contract", async () => {
    let fundMe, deployer, mockV3Aggregator
    beforeEach("Deploying the contract", async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer,
        )
    })
    describe("Test for constructor", async () => {
        it("Test for price feed address", async () => {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.target)
        })
    })
    describe("Test for fund()", async () => {
        it("Fails when enough ETH is not sent", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Not enough funds")
        })
        it("Updates the fundedList data structure", async () => {
            await fundMe.fund({ value: SEND_VALUE })
            assert.equal(await fundMe.fundedList(0), deployer)
        })
        it("Updates the addressToAmountFunded data structure", async () => {
            await fundMe.fund({ value: SEND_VALUE })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response, SEND_VALUE)
        })
        it("Check version of the Mock contract", async () => {
            assert.equal(
                await fundMe.getVersion(),
                await mockV3Aggregator.version(),
            )
        })
    })
    describe("Test for withdraw()", async () => {
        beforeEach("Fund the contract first", async () => {
            await fundMe.fund({value: SEND_VALUE})
        })
        it("Withdrawn by owner", async () => {
            const initialFundMeBalance = await ethers.provider.getBalance(fundMe.target)
            const initialDeployerBalance = await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const endFundMeBalance = await ethers.provider.getBalance(fundMe.target)
            const endDeployerBalance = await ethers.provider.getBalance(deployer)
            const {gasUsed, gasPrice} = transactionReceipt
            const gasCost = BigInt(gasUsed) * (BigInt(gasPrice))

            assert.equal(endFundMeBalance, 0)
            assert.equal(initialFundMeBalance + initialDeployerBalance, endDeployerBalance + gasCost)
        })
    })
})

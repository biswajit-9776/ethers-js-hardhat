const { getContractFactory } = require("@nomicfoundation/hardhat-ethers/types")
const { expect } = require("chai")
const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA,
} = require("hardhat/builtin-tasks/task-names")

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
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.target)
        })
    })
    describe("Test for fund()", async () => {
        it("Fails when enough ETH is not sent", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Not enough funds")
        })
        it("Updates the s_fundedList data structure", async () => {
            await fundMe.fund({ value: SEND_VALUE })
            assert.equal(await fundMe.s_fundedList(0), deployer)
        })
        it("Updates the s_addressToAmountFunded data structure", async () => {
            await fundMe.fund({ value: SEND_VALUE })
            const response = await fundMe.s_addressToAmountFunded(deployer)
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
            await fundMe.fund({ value: SEND_VALUE })
        })
        it("Withdrawn by owner", async () => {
            const initialFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const endFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const endDeployerBalance =
                await ethers.provider.getBalance(deployer)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            assert.equal(endFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                endDeployerBalance + gasCost,
            )
        })

        it("It allows to withdraw for multiple owners", async () => {
            let fundMeCurrentConnectedContract
            let accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                fundMeCurrentConnectedContract = await fundMe.connect(
                    accounts[i],
                )
                await fundMeCurrentConnectedContract.fund({
                    value: SEND_VALUE,
                })
            }
            const initialFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const endDeployerBalance =
                await ethers.provider.getBalance(deployer)

            assert.equal(endFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                endDeployerBalance + gasCost,
            )
            // check if fundersList and fundersToAmountFunded reset properly
            await expect(fundMe.s_fundedList(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address),
                    0,
                )
            }
        })

        it("Fails when withdrawn by other than owner", async () => {
            const accounts = await ethers.getSigners()
            const randomAccount = accounts[3]
            const fundMeConnectedContract = await fundMe.connect(randomAccount)
            await expect(
                fundMeConnectedContract.withdraw(),
            ).to.be.revertedWithCustomError(
                fundMeConnectedContract,
                "FundMe__NotOwner",
            )
        })
    })

    describe("Test for cheaperWithdraw()", async () => {
        beforeEach("Fund the contract first", async () => {
            await fundMe.fund({ value: SEND_VALUE })
        })
        it("Withdrawn by owner", async () => {
            const initialFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const endFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const endDeployerBalance =
                await ethers.provider.getBalance(deployer)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            assert.equal(endFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                endDeployerBalance + gasCost,
            )
        })

        it("It allows to withdraw for multiple owners", async () => {
            let fundMeCurrentConnectedContract
            let accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                fundMeCurrentConnectedContract = await fundMe.connect(
                    accounts[i],
                )
                await fundMeCurrentConnectedContract.fund({
                    value: SEND_VALUE,
                })
            }
            const initialFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const initialDeployerBalance =
                await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            )
            const endDeployerBalance =
                await ethers.provider.getBalance(deployer)

            assert.equal(endFundMeBalance, 0)
            assert.equal(
                initialFundMeBalance + initialDeployerBalance,
                endDeployerBalance + gasCost,
            )
            // check if fundersList and fundersToAmountFunded reset properly
            await expect(fundMe.s_fundedList(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(accounts[i].address),
                    0,
                )
            }
        })

        it("Fails when withdrawn by other than owner", async () => {
            const accounts = await ethers.getSigners()
            const randomAccount = accounts[3]
            const fundMeConnectedContract = await fundMe.connect(randomAccount)
            await expect(
                fundMeConnectedContract.cheaperWithdraw(),
            ).to.be.revertedWithCustomError(
                fundMeConnectedContract,
                "FundMe__NotOwner",
            )
        })
    })
})

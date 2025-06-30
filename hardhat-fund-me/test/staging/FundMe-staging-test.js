const { assert } = require("chai")
const { network, ethers, getNamedAccounts, deployments } = require("hardhat")
const { deploymentChains } = require("../../helper-hardhat-config")
const SEND_VALUE = ethers.parseEther("0.08")
deploymentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Test on testnet", async () => {
        let fundMe, deployer
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("It allows people to withdraw funds", async () => {
              const fundTxResponse = await fundMe.fund({ value: SEND_VALUE })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target,
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal...",
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })

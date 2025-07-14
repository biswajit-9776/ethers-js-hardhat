const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Staging test for Raffle", function () {
          let raffle, entranceFee

          beforeEach("Deploying mocks and Raffle contract", async () => {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              entranceFee = await raffle.getEntranceFee()
          })

          describe("A winner to be picked and awarded", () => {
              it(async () => {
                  const startingTimeStamp = block.timestamp
                  const accounts = await ethers.getSigners()
                  new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked even fired...")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const endingWinnerBalance =
                                  await ethers.provider.getBalance(recentWinner)
                              const endingTimeStamp = await raffle.getLatestTimestamp()
                              const raffleState = await raffle.getRaffleState()
                              await expect(raffle.getPlayer()).to.be.reverted()
                              assert.equal(recentWinner.toString(), accounts[0].target)
                              assert.equal(endingWinnerBalance, startinWInnerBalance + entranceFee)
                              assert.equal(raffleState, 0)
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject()
                          }
                      })
                      const startinWInnerBalance = await ethers.provider.getBalance(
                          accounts[0].target,
                      )
                      console.log("Entering Raffle...")
                      await raffle.enterRaffle({ value: entranceFee })
                  })
              })
          })
      })

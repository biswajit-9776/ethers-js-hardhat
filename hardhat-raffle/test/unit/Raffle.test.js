const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { deploymentChains, networkConfig } = require("../../helper-hardhat-config")
const { expect, assert } = require("chai")

!deploymentChains.includes(network.name)
    ? describe.skip
    : describe("Unit test for Raffle", async function () {
          let vrfCoordinator, raffle
          const chainId = network.config.chainId
          let entranceFee
          let deployer
          beforeEach("Deploying mocks and Raffle contract", async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffle = await ethers.getContract("Raffle", deployer)
              entranceFee = await raffle.getEntranceFee()
          })

          describe("Test for constructor", async () => {
              it("Test for raffleState initialization", async () => {
                  const requiredRaffleState = "0"
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), requiredRaffleState)
              })
              it("Test for interval initialization", async () => {
                  const interval = await raffle.getInterval()
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
              it("Test for entranceFee initialization", async () => {
                  const entranceFee = await raffle.getEntranceFee()
                  assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
              })
              it("Test for entranceFee initialization", async () => {
                  const entranceFee = await raffle.getEntranceFee()
                  assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
              })
          })
          describe("Enter Raffle", async () => {
              it("Reverts when not paid enough", async () => {
                  const fee = ethers.parseEther("0.01")
                  await expect(raffle.enterRaffle({ value: fee })).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__NotEnoughETHSent",
                  )
              })
              it("Records players when they enter the raffle", async () => {
                await raffle.enterRaffle({value: entranceFee})
                assert.equal(deployer, await raffle.getPlayer(0))
              })
          })
      })

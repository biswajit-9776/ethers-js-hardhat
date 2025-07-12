const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { deploymentChains, networkConfig } = require("../../helper-hardhat-config")
const { expect, assert } = require("chai")
const { int } = require("hardhat/internal/core/params/argumentTypes")

!deploymentChains.includes(network.name)
    ? describe.skip
    : describe("Unit test for Raffle", function () {
          let vrfCoordinatorV2Mock, raffle, deployer, entranceFee, interval
          const chainId = network.config.chainId

          beforeEach("Deploying mocks and Raffle contract", async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffle = await ethers.getContract("Raffle", deployer)
              entranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("Test for constructor", () => {
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
          describe("Test for enterRaffle()", () => {
              it("Reverts when not paid enough", async () => {
                  const fee = ethers.parseEther("0.01")
                  await expect(raffle.enterRaffle({ value: fee })).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle__NotEnoughETHSent",
                  )
              })
              it("Emits event when entered into raffle", async () => {
                  await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(
                      raffle,
                      "RaffleEnter",
                  )
              })
              it("Records players when they enter the raffle", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  assert.equal(deployer, await raffle.getPlayer(0))
              })
              it("Doesn't allow players to enter the raffle when it's is CALCULATING state", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await raffle.performUpkeep("0x")
                  await expect(
                      raffle.enterRaffle({ value: entranceFee }),
                  ).to.revertedWithCustomError(raffle, "Raffle__NotOpen")
              })
          })

          describe("Test for checkUpkeep()", () => {
              it("Returns false when people haven't paid any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.checkUpkeep("0x")
                  assert(!upkeepNeeded)
              })
              it("Returns false when raffle isn't open", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await raffle.performUpkeep("0x")
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = await raffle.checkUpkeep("0x")
                  assert.equal(raffleState.toString(), "1")
                  assert(!upkeepNeeded)
              })
              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) - 5]) // use a higher number here if this test fails
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded)
              })
          })
          describe("Test for performUpkeep()", () => {
              it("Returns true if checkUpkeep is true", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.performUpkeep("0x")
                  assert(!upkeepNeeded)
              })
              it("Reverts when checkUpkeep() returns false", async () => {
                  await expect(raffle.performUpkeep("0x"))
                      .to.be.revertedWithCustomError(raffle, "Raffle__UpkeepNotNeeded")
                      .withArgs(0, 0, 0)
              })
              it("Reverts when checkUpkeep() returns false", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const transactionResponse = await raffle.performUpkeep("0x")
                  const transactionReceipt = await transactionResponse.wait(1)
                  const requestId = transactionReceipt.logs[1].args.requestId
                  assert(requestId > 0)
              })
          })
          describe("Test for fulfillRandomWords()", function () {
              beforeEach("Someone to have entered the raffle before it calls", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [Number(interval) + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
              })
              it("It can be called only when requestId is sent by requestRandomWords()", async () => {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.target),
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.target),
                  ).to.be.revertedWith("nonexistent request")
              })
              it("Picks a winner, resets the lottery and sends the money", async () => {
                const additionalEntrants = 3
                const accountStartingIndex = 1
                const accounts = await ethers.getSigner()
                for(let i = accountStartingIndex; i < accountStartingIndex + additionalEntrants; i++){
                    const accountConnectedRaffle = raffle.connect(accounts[i])
                    await accountConnectedRaffle.enterRaffle({value: entranceFee})
                }
                const startingTimeStamp = await raffle.getLatestTimeStamp()

                await new Promise(async (resolve, reject,) => {
                    try{
                        const recentWinner = await raffle.getRecentWinner()
                        console.log(`Recent Winner is ${recentWinner}`)
                        const endingTimeStamp = await raffle.getLatestTimeStamp()

                        resolve()
                    }
                    catch(e){
                        reject()
                    }
                })
                const tx = await raffle.performUpkeep()
                const txReceipt = await tx.wait(1)
                const receipId = txReceipt.logs[1].args.receipId
                await vrfCoordinatorV2Mock.fulfillRandomWords(receipId, raffle.address)
              })
          })
      })

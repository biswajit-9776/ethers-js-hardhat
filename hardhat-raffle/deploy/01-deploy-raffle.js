const { ethers, network } = require("hardhat")
const { networkConfig, deploymentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const VRF_SUB_FUND_AMOUNT = ethers.parseEther("2")
module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const entrancFee = networkConfig[chainId]["entranceFee"]
    const keyHash = networkConfig[chainId]["key_hash"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    let vrfCoordinatorV2Address, subscriptionId
    if (deploymentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.target
        const transactionResponse = await VRFCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.logs[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2Address"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const args = [
        entrancFee,
        keyHash,
        subscriptionId,
        callbackGasLimit,
        vrfCoordinatorV2Address,
        interval,
    ]

    if (deploymentChains.includes(network.name)) {
        const raffle = await deploy("Raffle", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: 1,
        })
        if (!deploymentChains.includes(network.name)) {
            log("Verifying contract Raffle...")
            await verify(raffle.address, args)
        }
    }
    log("Raffle contract deployed!!!")
    log("----------------------------------------------------------")
}
module.exports.tags = ["all", "raffle"]

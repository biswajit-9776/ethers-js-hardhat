const { ethers, getNamedAccounts, network } = require("hardhat")
const { networkConfig, deploymentChains } = require("../helper-hardhat-config")

const BASEFEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9

module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const deployer = getNamedAccounts()
    const { deploy, log } = deployments
    if (deploymentChains.includes(network.name)) {
        log("Local network found. Deploying mocks...")
        await deploy("VRFCoordinatorMock", {
            from: deployer,
            args: [BASEFEE, GAS_PRICE_LINK],
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1
        })
        log("Mocks deployed!!!")
        log("----------------------------------------------------------")

    }
}

module.exports.tags = ["all", "mocks"]

const { ethers, network } = require("hardhat")
const { deploymentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    console.log("Deploying contract FunStorage...")

    const funStorage = await deploy("FunStorage", {
        from: deployer,
        args: [],
        log: true,
    })
    log("----------------------------------------------")
    if (!deploymentChains.includes(network.name))
        await verify(funStorage.address, [])
    for (let i = 0; i < 10; i++) {
        log(
            `Location ${i}: ${await ethers.provider.getStorage(funStorage.address, i)}`,
        )
    }
}
module.exports.tags = ["storage"]

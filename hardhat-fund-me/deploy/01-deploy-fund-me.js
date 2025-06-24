const { networkConfig, deploymentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
module.exports = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethToUsdPriceFeedAddress
    if (deploymentChains.includes(network.name)) {
        const ethToUsdPriceAggragator =
            await deployments.get("MockV3Aggregator")
        ethToUsdPriceFeedAddress = ethToUsdPriceAggragator.address
    } else {
        ethToUsdPriceFeedAddress =
            networkConfig[chainId]["ethToUsdPriceFeedAddress"]
    }
    const args = [ethToUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
    })
    if (!deploymentChains.includes(network.name)) {
        verify(fundMe.address, args)
    }

    log("----------------------------------------------")
}
module.exports.tags = ["all", "fundme"]

// This script is to be run after running the command 'yarn hardhat node'
// which will deploy the contracts locally
const { deployments, ethers, getNamedAccounts } = reuqire("hardhat")
async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.provider.getContract("FundMe", deployer)
    console.log(`Got contract FundMe at address ${fundMe.address}`)

    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("Funds withdrawn!!!")
}

main()
    .then(() => process.exit(1))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

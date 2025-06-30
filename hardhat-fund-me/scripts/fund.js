// This script is to be run after running the command 'yarn hardhat node'
// which will deploy the contracts locally
const { deployments, ethers, getNamedAccounts } = reuqire("hardhat")
const SEND_VALUE = ethers.parseEther("0.08")
async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.provider.getContract("FundMe", deployer)
    console.log(`Found contract FundMe at address ${fundMe.address}`)

    const transactionResponse = await fundMe.fund({ value: SEND_VALUE })
    await transactionResponse.wait(1)
    console.log("Contract deployed!!!")
}

main()
    .then(() => process.exit(1))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

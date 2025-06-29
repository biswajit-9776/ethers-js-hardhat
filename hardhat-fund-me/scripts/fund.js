const {deployments, ethers, getNamedAccounts} = reuqire("hardhat")
const SEND_VALUE = ethers.parseEther("0.08")
async function main() {
    const {deployer} = await getNamedAccounts()
    const {deploy} = await deployments
    const fundMe = await ethers.provider.getContract("FundMe", deployer)

    const transactionResponse = await fundMe.fund({value: SEND_VALUE})
    await transactionResponse.wait(1)
    console.log("Contract deployed!!!")
}

main()
    .then(() => process.exit(1))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

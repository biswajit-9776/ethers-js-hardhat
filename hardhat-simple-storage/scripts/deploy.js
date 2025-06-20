const { ethers, run, network } = require("hardhat")

async function main() {
    const SimpleStorageFactory =
        await ethers.getContractFactory("SimpleStorage")
    console.log("Deploying contract...")

    const simpleStorage = await SimpleStorageFactory.deploy()

    console.log(`Deployed contract to address ${simpleStorage.target}`)
    // for Rinkeby netwrok, chainID  is 4.
    // Hardhat is not supported for contract verification.
    // if (network.config.chainId === 4) {
    //     await verify(simpleStorage.target, [])
    // }

    // Interacting with the contract
    const favoriteNumber = await simpleStorage.retrieve()
    console.log(`Current favorite number is ${favoriteNumber}`)

    const transactionResponse = await simpleStorage.store(9)
    await transactionResponse.wait(1)
    const updatedFavoriteNumber = await simpleStorage.retrieve()
    console.log(`Updated fvorite number is ${updatedFavoriteNumber}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...")
    // Usually when a contract is already verified, re verifying throws an error
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified...")
        } else {
            console.log(e)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

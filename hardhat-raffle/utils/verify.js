const { run } = require("hardhat")

verify = async (contractAddress, args) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified")
        } else {
            console.log(error)
        }
    }
}
module.exports = { verify }

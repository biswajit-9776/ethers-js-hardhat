require("@nomicfoundation/hardhat-toolbox")
require("./tasks/block-number")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    // networks: {
    //     ganache: {},
    // },
    solidity: "0.8.28",
}

const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
  let provider = new ethers.JsonRpcApiProvider("http://0.0.0.0:8545");
  let wallet = new ethers.Wallet("", provider);

  let abi = fs.readFile("./SimpleStorage_sol_StimpleStorgae.abi", "utf-8");
  let binary = fs.readFile("./SimpleStorage_sol_StimpleStorgae.bin", "utf-8");
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  console.log("Deploying Contract, please wait...");
  const contract = await contractFactory.deploy();
  console.log(contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

main();

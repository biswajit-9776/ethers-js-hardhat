const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
  let provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
  let wallet = new ethers.Wallet(
    "0x39306da43597395e0c1f824677fa834d04f57eb2e57e2a94a23d8a6541cc9cd2",
    provider
  );

  let abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  let binary = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8");
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  console.log("Deploying Contract, please wait...");
  const contract = await contractFactory.deploy({ gasLimit: 3000000 });
  // const transactionReceipt = await contract.deployTransaction.wait(1);

  //   console.log("Here is the deployment transaction(transaction response): ");
  // console.log(contract.deployTransaction);

  //   console.log("Here is the transaction receipt: ");
  //   console.log(transactionReceipt);

  console.log(contract);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

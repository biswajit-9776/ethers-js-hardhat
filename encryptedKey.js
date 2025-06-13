const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  let wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  let encryptedJsonKey = await wallet.encryptSync(
    process.env.PRIVATE_KEY_PASSWORD,
    process.env.PRIVATE_KEY
  );
  console.log(encryptedJsonKey);

  fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

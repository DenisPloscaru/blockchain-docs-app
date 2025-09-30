import "dotenv/config";
import "@nomicfoundation/hardhat-verify";
import hre, { run } from "hardhat";

async function main() {
  await run("verify:verify", {
    address: "0xd2a0382fe7e3aB9E2Eb28386d3479b0cE1be6951",
    constructorArguments: [], // add args if your constructor has any
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

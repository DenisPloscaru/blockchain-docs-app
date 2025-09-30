import "dotenv/config";
import "@nomicfoundation/hardhat-verify"; // <- this registers the task
import hre from "hardhat";

async function main() {
  await hre.run("verify:verify", {
    address: "0xd2a0382fe7e3aB9E2Eb28386d3479b0cE1be6951",
    constructorArguments: [], // put args here if your contract has any
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


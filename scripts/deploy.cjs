const hre = require("hardhat");

async function main() {
  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  console.log("Verifier deployed to:", await verifier.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

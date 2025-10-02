import hre from "hardhat";

async function main() {
  // Deploy
  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const address = await verifier.getAddress();

  console.log("\n✅ Verifier deployed to:", address);

  // Optional: wait a few blocks so Etherscan picks up the bytecode
  const tx = verifier.deploymentTransaction();
  await tx.wait(5);

  // Optional: Verify on Etherscan
  try {
    await hre.run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("🔎 Etherscan verification: success");
  } catch (err) {
    console.log("ℹ️ Verification skipped/failed:", err.message || err);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

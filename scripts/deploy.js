import { readFileSync, writeFileSync } from "fs";
import { ethers } from "ethers";

async function main() {
  // load compiled contract artifact
  const artifact = JSON.parse(
    readFileSync("artifacts/contracts/Verifier.sol/Verifier.json", "utf-8")
  );

  // connect to Hardhat localhost
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // use first test account from Hardhat
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  // deploy contract
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("Verifier deployed to:", addr);

  // write to frontend JSON file
  writeFileSync(
    "src/contract-address.json",
    JSON.stringify({ address: addr }, null, 2)
  );
  console.log("Wrote address to src/contract-address.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

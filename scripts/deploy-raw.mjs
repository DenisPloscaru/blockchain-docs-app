// scripts/deploy-raw.mjs
import 'dotenv/config';
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { ethers } from "ethers";

async function getWallet(provider) {
  // Option A: explicit PRIVATE_KEY from .env
  if (process.env.PRIVATE_KEY) {
    return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  }

  // Option B: derive by ACCOUNT_INDEX from Hardhat's default mnemonic
  const MNEMONIC = process.env.HARDHAT_MNEMONIC
    ?? "test test test test test test test test test test test junk";
  const INDEX = Number(process.env.ACCOUNT_INDEX ?? 0); // pick 0..19
  const hd = ethers.HDNodeWallet.fromPhrase(MNEMONIC).derivePath(`m/44'/60'/0'/0/${INDEX}`);
  return new ethers.Wallet(hd.privateKey, provider);
}

async function main() {
  // 1) Load artifact compiled by Hardhat
  const artifact = JSON.parse(
    readFileSync("artifacts/contracts/Verifier.sol/Verifier.json", "utf-8")
  );

  // 2) Connect to local Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 3) Choose WHICH account to deploy from
  const wallet = await getWallet(provider);
  console.log("Deploying with account:", await wallet.getAddress());

  // 4) Deploy
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("Verifier deployed to:", addr);

  // 5) Write address for the frontend
  writeFileSync(
    resolve("./src/contract-address.json"),
    JSON.stringify({ address: addr }, null, 2)
  );
  console.log("Wrote address to src/contract-address.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

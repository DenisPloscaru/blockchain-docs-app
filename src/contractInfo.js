
// Import the JSON as the default object, then read its .address
import contractAddress from "./contract-address.json";
export const CONTRACT_ADDRESS = contractAddress.address;

export const CONTRACT_ABI = [
 {
    "inputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "internalType": "string",  "name": "uri",  "type": "string" }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // reads
  {
    "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
    "name": "isRegistered",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserDocs",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view", "type": "function"
  },
  {
    // auto-generated getter for public mapping `docs`
    "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
    "name": "docs",
    "outputs": [
      { "internalType": "string", "name": "uri", "type": "string" },
      { "internalType": "bool",   "name": "exists", "type": "bool" }
    ],
    "stateMutability": "view", "type": "function"
  }
];

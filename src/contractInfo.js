
// Import the JSON as the default object, then read its .address
import contractAddress from "./contract-address.json";
export const CONTRACT_ADDRESS = contractAddress.address;

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "internalType": "string", "name": "uri",  "type": "string" }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" }
    ],
    "name": "isRegistered",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

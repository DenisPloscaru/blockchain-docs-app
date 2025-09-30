// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Verifier {
    mapping(bytes32 => string) public documents;

    function register(bytes32 hash, string memory uri) public {
        documents[hash] = uri;
    }

    function isRegistered(bytes32 hash) public view returns (bool) {
        return bytes(documents[hash]).length > 0;
    }
}

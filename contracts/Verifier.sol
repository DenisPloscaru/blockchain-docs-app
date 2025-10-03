// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Verifier {
    struct Doc { string uri; bool exists; }

    // hash -> doc data
    mapping(bytes32 => Doc) public docs;

    // user -> their hashes (for "My Documents")
    mapping(address => bytes32[]) private userDocs;

    event Registered(address indexed user, bytes32 hash, string uri);

    function register(bytes32 hash, string memory uri) external {
        require(!docs[hash].exists, "Already registered");
        docs[hash] = Doc(uri, true);
        userDocs[msg.sender].push(hash);
        emit Registered(msg.sender, hash, uri);
    }

    function isRegistered(bytes32 hash) external view returns (bool) {
        return docs[hash].exists;
    }

    function getUserDocs(address user) external view returns (bytes32[] memory) {
        return userDocs[user];
    }
}

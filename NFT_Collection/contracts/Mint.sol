// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";
contract Mint is ERC721URIStorage {
    constructor(string memory _metadata, string memory _name, string memory _symbol)
    ERC721(_name, _symbol) {
        _mint(msg.sender, 1);
        _setTokenURI(1, _metadata);
    }

}


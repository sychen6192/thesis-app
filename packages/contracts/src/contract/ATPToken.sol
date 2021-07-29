// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.0.0/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.0.0/contracts/utils/Counters.sol";
import "./Registry.sol";


contract ATPToken is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(address=>bool) allowToMintToken;
    address adminAddress;
    address factoryAddress;
    Registry immutable registry;


    constructor() public ERC721("A TokenPolicy", "ATP") {
        registry = Registry(0xF5b79544Affa9461aa00954707887E423BCd0E85);
        adminAddress = msg.sender;

    }

     modifier onlyPolicy() {
        require(allowToMintToken[msg.sender], 'You are not valid policy address.');
        _;
    }
    
    function setFactoryAddress() public {
        require(msg.sender == adminAddress, 'only admin');
        factoryAddress = factoryAddress = registry.factoryAddress();
    }

    
    function addPolicyAddress(address policyAddress)
        public
    {
        require(msg.sender == factoryAddress);
        allowToMintToken[policyAddress] = true;
    }
    
    function issueToken(address insurer, string memory tokenURI)
        public
        onlyPolicy
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(insurer, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
    
    function checkPolicyToken(address insurer, string memory query) public view returns (bool, uint){
        require(balanceOf(insurer) > 0, 'You do not have policy token');
        for (uint i = 1; i <= totalSupply(); i++) {
            if (keccak256(abi.encodePacked(tokenURI(i))) == keccak256(abi.encodePacked(query))) {
                if (ownerOf(i) == insurer){
                    return (true, i);
                }
            }
        }
        return (false, 0);
    }
}
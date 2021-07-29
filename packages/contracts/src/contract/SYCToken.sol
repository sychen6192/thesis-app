// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.0.0/contracts/token/ERC20/ERC20.sol";
import "./Registry.sol";

contract SYCToken is ERC20 {
    
    mapping(address=>bool) public allowToMintToken;
    address public adminAddress;
    address public factoryAddress;
    Registry immutable registry;

    constructor(uint256 initialSupply, address _minter) public ERC20 ("SYC coin", "SYC") {
        registry = Registry(0xF5b79544Affa9461aa00954707887E423BCd0E85);
        _mint(_minter, initialSupply);
        adminAddress = msg.sender;
    }
    
     modifier onlyPolicy() {
        require(allowToMintToken[msg.sender] == true, 'You are not valid policy address.');
        _;
    }
    
    function setFactoryAddress() public {
        require(msg.sender == adminAddress, 'only admin');
        factoryAddress = factoryAddress = registry.factoryAddress();
    }

    
    function addPolicyAddress(address policyAddress)
        public
    {
        require(msg.sender == factoryAddress, 'factoryAddress only');
        allowToMintToken[policyAddress] = true;
    }
    
    function issueToken(address insurer, uint sycAmount)
        public
        onlyPolicy
    {
        _mint(insurer, sycAmount);
    }
}
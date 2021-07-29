// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.6;

contract Registry {
    uint public insurerCount;
    uint public delegatorCount;
    mapping(address=>Insurer) public mapInsurers;
    mapping(address=>bool) public validInsurers;
    mapping(address=>bool) public validDelegators;
    address public factoryAddress;
    address public adminAddress;

    constructor() public {
        adminAddress = msg.sender;
        insurerCount = 0;
        delegatorCount = 0;
    }
    
    struct Insurer {
      string userId;
      string userName;
      bytes32 refId;
    }
    
    mapping (bytes32 => address) public refToAddress;
    
    function setFactoryAddress(address _factoryAddress) public {
        require(msg.sender == adminAddress, 'only admin');
        factoryAddress = _factoryAddress;
    }
    
    function register(string memory userId, string memory userName) public {
        require(validInsurers[msg.sender] == false, 'You are already a member');
        bytes32 tmp = keccak256(abi.encodePacked(userId, userName));
        Insurer memory newInsurer = Insurer({
           userId: userId,
           userName: userName,
           refId: tmp
        });
        insurerCount++;
        validInsurers[msg.sender] = true;
        mapInsurers[msg.sender] = newInsurer;
        refToAddress[tmp] = msg.sender;
    }
    
    function getRefCode() public view returns(bytes32) {
        return mapInsurers[msg.sender].refId;
    }
      
    function setDelegators(address insurer) public {
        if (!validDelegators[insurer]) {
            delegatorCount++; 
        }
        validDelegators[insurer] = true;
    }
    
    function getDelegatorCount() public view returns(uint) {
        return delegatorCount;
    }
    
    function changeDelegator(address newInsurer) public {
        require(validDelegators[newInsurer]);
        validDelegators[msg.sender] = false;
        validDelegators[newInsurer] = true;
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.8.0;

import './Policy.sol';
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.0.0/contracts/utils/Counters.sol";

contract PolicyFactory {
    uint256 MAX_INT = 2**256 - 1;
    address[] public deployedPolicies;
    Policy[] public policies;
    IUniswapV2Router01 immutable uniswapV2Router01;
    SYCToken immutable syc;
    ATPToken immutable atp;
    Registry immutable registry;
    IUniswapV2Pair immutable uniswapV2Pair;


    constructor() public {
      syc = SYCToken(0xcb77eE0ED56e8012Da231fd4b5f92530a6AE23F7);
      atp = ATPToken(0x29146Bc9aE57052d22244B3b2380aB4c8FE8500f);
      uniswapV2Router01 = IUniswapV2Router01(0xf164fC0Ec4E93095b804a4795bBe1e041497b92a);
      registry = Registry(0xF5b79544Affa9461aa00954707887E423BCd0E85);
      uniswapV2Pair = IUniswapV2Pair(0x88F9F0C803c1D4e9f745dEAb6fC701933c14F7B7);
    }

    function createPolicy(
        string memory policyTitle,
        string memory policyType,
        uint policyBase,
        uint policyStartTime,
        uint policyEndTime,
        string memory tokenURI,
        uint policyDeadline
        )
        public {
            require(registry.validInsurers(msg.sender), 'have not registered');
            Policy newPolicy = new Policy(
                policyTitle,
                policyType,
                policyBase,
                policyStartTime,
                policyEndTime,
                tokenURI,
                policyDeadline,
                address(this),
                msg.sender
                );
            policies.push(newPolicy);
                
            // create policy contract
            deployedPolicies.push(address(newPolicy));
            registry.setDelegators(msg.sender);
            // gives policy contract mint right
            syc.addPolicyAddress(address(newPolicy));
            atp.addPolicyAddress(address(newPolicy));
            atp.setApprovalForAll(address(newPolicy), true);
            // give transferFrom right 
            uniswapV2Pair.approve(address(newPolicy), MAX_INT);
    }
    
    function getDeloyedPolicies() public view returns (address[] memory) {
        return deployedPolicies;
    }
    

    

}
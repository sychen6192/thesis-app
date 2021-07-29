// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.7.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.0.0/contracts/math/SafeMath.sol";
import "./SYCToken.sol";
import "./ATPToken.sol";
import "./IUniswapV2Router01.sol";
import "./IUniswapV2Pair.sol";
import "./Registry.sol";

contract Policy {

    using SafeMath for uint;
    string public policyTitle;
    uint public policyBase;
    string public policyType;
    uint public policyStartTime;
    uint public policyEndTime;
    string public policyTokenURI;
    uint public totalStakeAmount;
    uint public policyDeadline;
    address proposer;
    address[] public policyStakeholders;
    
    uint public votePercentLimit;
    // The threshold for the proposal to have as Yes to be passed as a Hospital.
    uint public votePercentAccept;
    
    mapping (address => bool) public isPolicyStakeholders;
    mapping (address => address) public endorser;
    mapping (address => uint) public tokenID;
    bool public claimed;
    uint[3] public addLiquidityResult;

    IUniswapV2Router01 immutable uniswapV2Router01;
    IUniswapV2Pair immutable uniswapV2Pair;
    SYCToken immutable syc;
    ATPToken immutable atp;
    Registry immutable registry;
    
    address SycAddress;
    address AtpAddress;
    address routerAddress;
    address pairAddress;
    address registryAddress;
    address payable factoryAddress;

    struct Request {
        string description_URI;
        uint multiple;
        address requester;
        bool complete;
        uint approvalCount;
        uint delApprovalCount;
        mapping(address => bool) approvals;
        mapping(address => bool) delApprovals;
    }
    Request[] public requests;

    constructor(
        string memory _policyTitle,
        string memory _policyType,
        uint _policyBase,
        uint _policyStartTime,
        uint _policyEndTime,
        string memory _tokenURI,
        uint _policyDeadline,
        address _factoryAddress,
        address _proposer
        ) public {
            // interface intialize
            SycAddress = 0xcb77eE0ED56e8012Da231fd4b5f92530a6AE23F7;
            AtpAddress = 0x29146Bc9aE57052d22244B3b2380aB4c8FE8500f;
            routerAddress = 0xf164fC0Ec4E93095b804a4795bBe1e041497b92a;
            pairAddress = 0x88F9F0C803c1D4e9f745dEAb6fC701933c14F7B7;
            registryAddress = 0xF5b79544Affa9461aa00954707887E423BCd0E85;
            
            syc = SYCToken(SycAddress);
            atp = ATPToken(AtpAddress);
            uniswapV2Router01 = IUniswapV2Router01(routerAddress);
            uniswapV2Pair = IUniswapV2Pair(pairAddress);
            registry = Registry(registryAddress);
            
            // Policy metadata
            policyTitle = _policyTitle;
            policyType = _policyType;
            policyBase = _policyBase;
            policyStartTime = _policyStartTime;
            policyEndTime = _policyEndTime;
            policyTokenURI = _tokenURI;
            policyDeadline = _policyDeadline;
            proposer = _proposer;
            factoryAddress = payable(_factoryAddress);
            claimed = false;
            
            // voting weight
            votePercentLimit = 66;
    }
    
    // platform to check syc amount
    function stakePolicy(uint SycAmount, bytes32 refCode) public payable returns (uint[3] memory){
        require(now < policyDeadline, 'sale closed');
        // specify refAddress
        address endorserAddress = registry.refToAddress(refCode);
        if (msg.sender != proposer) {
            require(endorserAddress != msg.sender, 'You can not use your own code');
            require(isPolicyStakeholders[endorserAddress] == true, 'wrong refCode');
        }
        require(registry.validInsurers(msg.sender), 'not the members');
        require(!isPolicyStakeholders[msg.sender], 'Already staked.');
        require(policyBase == msg.value, 'Insufficient value');
        require(syc.transferFrom(msg.sender, address(this), SycAmount));
        // Do remember to approve
        syc.approve(routerAddress, SycAmount);
        // provide liquidity
        // the LP send to token contract
        (addLiquidityResult[0], addLiquidityResult[1], addLiquidityResult[2]) =
        uniswapV2Router01.addLiquidityETH{value: msg.value}(SycAddress, SycAmount, 0, 0, factoryAddress, now + 120);
        totalStakeAmount = totalStakeAmount + SycAmount;
        policyStakeholders.push(msg.sender);
        isPolicyStakeholders[msg.sender] = true;
        endorser[msg.sender] = endorserAddress;
        // 5,5分
        syc.issueToken(msg.sender, SycAmount.mul(50).div(100));
        syc.issueToken(endorserAddress, SycAmount.mul(50).div(100));
        atp.issueToken(msg.sender, policyTokenURI);
        return addLiquidityResult;
    }
    

    
    function createRequest(string memory _description_URI, uint _multiple) public {
        require(now >= policyStartTime, 'policyStartTime error');
        require(now <= policyEndTime, 'policyEndTime error.');
        require(isPolicyStakeholders[msg.sender], 'You are not the member.');
        // staking the same insurance to token Contract.
        (bool state, uint id) = atp.checkPolicyToken(msg.sender, policyTokenURI);
        require(state, 'You do not have tokens');
        // 要先approve到這到這
        atp.transferFrom(msg.sender, address(this), id);
        tokenID[msg.sender] = id;
        Request memory newRequest = Request({
           description_URI: _description_URI,
           multiple: _multiple,
           requester: msg.sender,
           complete: false,
           approvalCount: 0,
           delApprovalCount: 0
        });

        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        // 檢查有沒有ATP tokens.
        
        require(registry.validInsurers(msg.sender), 'have not registered');
        require(isPolicyStakeholders[msg.sender], 'You are not stakeholders');

        require(!request.approvals[msg.sender], 'You have already voted.');
        require(!request.complete, 'Request is complete.');
        
        request.approvalCount++;
        request.approvals[msg.sender] = true;
    }
    
    function delApproveRequest(uint index) public {
        Request storage request = requests[index];
        // 檢查有沒有ATP tokens.
        
        require(registry.validInsurers(msg.sender), 'have not registered');
        require(registry.validDelegators(msg.sender), 'You are not Delegator');
        require(!request.delApprovals[msg.sender], 'You have already voted.');
        require(!request.complete, 'Request is complete.');

        request.delApprovalCount++;
        request.delApprovals[msg.sender] = true;
    }
    
    
    function getCurrentLP() public view returns(uint){
        (,uint112 _reserve1,) = uniswapV2Pair.getReserves(); // gas savings
        uint _totalSupply = uniswapV2Pair.totalSupply();
        uint liquidity = policyBase.mul(_totalSupply).div(_reserve1);
        return liquidity;
    }


    // 這裡要預防使用者過少詐領保險金
    function claimRequest(uint index) public {
        require(now >= policyStartTime, 'policyStartTime error');
        Request storage request = requests[index];
        // 發起人自行終結
        require(!request.complete, 'Request is complete.');
        require(request.requester == msg.sender, 'You are not requester.');
        // verification
        require(request.approvalCount > policyStakeholders.length.mul(66).div(100), ' < 66% voted');
        require(request.delApprovalCount > registry.getDelegatorCount().mul(66).div(100), ' < 66% delegators voted');
    
        // 給他錢啦 half share
        uint reimbursement = getCurrentLP().mul(request.multiple).mul(50).div(100);
        uniswapV2Pair.transferFrom(factoryAddress, request.requester, reimbursement);
        // 他質押的policy還給他
        atp.transferFrom(address(this), request.requester, tokenID[msg.sender]);
        request.complete = true;
        // 已經出險過了
        claimed = true;
    }
    
    
    // get return
    function finalizePolicy() public {
        require(now > policyEndTime, 'Policy duration is not over.');
        // 不能夠出險過
        require(!claimed);
        // 發lp回去給大家 40%
        uint remaining = uniswapV2Pair.balanceOf(address(this)).mul(40).div(100);
        for (uint i = 0; i < policyStakeholders.length; i++) {
            uniswapV2Pair.transferFrom(factoryAddress, policyStakeholders[i], remaining.div(policyStakeholders.length));
        }
        selfdestruct(factoryAddress);
    }
    
    function getSummary() public view returns (
        string memory, uint, string memory, uint, address
    ) {
        return (
            policyTitle,
            policyBase,
            policyTokenURI,
            totalStakeAmount,
            proposer
        );
    }
    
    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
    
    function getPolicyStakeholders() public view returns (address[] memory) {
        return policyStakeholders;
    }
}
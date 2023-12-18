// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SafeBank {

    mapping(address => uint256) public balances;

    function deposit(address to) public payable {
        require(to != address(0), "Invalid address");
        balances[to] += msg.value;
    }

    function withdraw(address _from, uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(balances[_from] >= _amount, "Insufficient balance");

        balances[_from] -= _amount;
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
    }
}

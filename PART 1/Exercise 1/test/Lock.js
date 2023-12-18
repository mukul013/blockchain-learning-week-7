const { ethers } = require('hardhat');
const { expect } = require('chai');

describe("EtherStore Vulnerability", function () {
  let EtherStore;
  let Attack;
  let etherStore;
  let attack;
  let addr1;
  let addr2; 
  let addr3;

  const ETH_AMOUNT =  ethers.parseUnits("1",18).toString()

  beforeEach(async function () {

    [,addr1,addr2,addr3] = await ethers.getSigners();

    EtherStore = await ethers.getContractFactory("EtherStore");
    etherStore = await EtherStore.deploy();
    
    Attack = await ethers.getContractFactory("Attack");
    attack = await Attack.deploy(etherStore.target);
  });

  it("should successfully perform the reentrancy attack", async function () {

    await etherStore.connect(addr1).deposit({ value: ETH_AMOUNT });
    await etherStore.connect(addr2).deposit({ value: ETH_AMOUNT });

    const initialEtherStoreBalance = await etherStore.getBalance();
    console.log("Initial EtherStore Balance:", initialEtherStoreBalance.toString());

    await attack.connect(addr3).attack({ value: ETH_AMOUNT });

    const finalEtherStoreBalance = await etherStore.getBalance();
    console.log("Final EtherStore Balance:", finalEtherStoreBalance.toString());

    const attackBalance = await attack.getBalance();
    console.log("Attack Contract Balance:", attackBalance.toString());

    expect(finalEtherStoreBalance).to.equal(0);
    expect(attackBalance).to.equal("3000000000000000000");
  });
});

describe("EtherStoreSecure", function () {

  let EtherStoreFixed;
  let etherStoreFixed;
  let addr1;
  let addr2;
  let addr3;

  const ETH_AMOUNT =  ethers.parseUnits("1",18).toString();

  console.log("Eth Amount " , ETH_AMOUNT);

  beforeEach(async function () {

    [,addr1,addr2,addr3] = await ethers.getSigners();
    EtherStoreFixed = await ethers.getContractFactory("EtherStoreFixed");
    etherStoreFixed = await EtherStoreFixed.deploy();

    Attack = await ethers.getContractFactory("Attack");
    attack = await Attack.deploy(etherStoreFixed.target);
  });

  it("should prevent reentrancy attack on EtherStoreSecure", async function () {

    await etherStoreFixed.connect(addr1).deposit({ value: ETH_AMOUNT });
    await etherStoreFixed.connect(addr2).deposit({ value: ETH_AMOUNT });

    const initialEtherStoreFixedBalance = await etherStoreFixed.getBalance();
    console.log("Initial EtherStoreSecure Balance:", initialEtherStoreFixedBalance.toString());

    await expect(attack.connect(addr3).attack({ value: ETH_AMOUNT })).to.be.revertedWith("Failed to send Ether");

    const finalEtherStoreFixedBalance = await etherStoreFixed.getBalance();
    console.log("Final EtherStoreSecure Balance:", finalEtherStoreFixedBalance.toString());

    expect(finalEtherStoreFixedBalance).to.equal("2000000000000000000");
  });
});
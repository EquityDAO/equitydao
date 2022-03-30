import { expect } from 'chai';
import { ethers } from 'hardhat';
import { constants } from 'ethers';

describe('EquiToken', function () {
  it('Should SUCCESSFULLY deploy contract', async function () {
    const totalSupply = '100000000000000000000000000';

    const signers = await ethers.getSigners();
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    const balance = await equiToken.balanceOf(signers[0].address);
    expect(balance.toString()).to.equal(totalSupply);
  });

  it('Should FAIL to transfer token if transfer amount exceeds 96 bits', async function () {
    const unsafe96Amount = BigInt(792281625142640000000000000000); // larger than 96 bits

    const signers = await ethers.getSigners();
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    await expect(equiToken.transfer(signers[1].address, unsafe96Amount)).to.be.revertedWith(
      'Equi::transfer: amount exceeds 96 bits',
    );
  });

  it('Should FAIL to transfer token to zero address', async function () {
    const transferAmount = 1000;

    const signers = await ethers.getSigners();
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    await expect(equiToken.transfer(constants.AddressZero, transferAmount)).to.be.revertedWith(
      'Equi::_transferTokens: cannot transfer to the zero address',
    );
  });

  it('Should FAIL to transfer token if transfer amount exceeds balance', async function () {
    const transferAmount = BigInt(1000000000000000000000000000); // larger than token balance

    const signers = await ethers.getSigners();
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    await expect(equiToken.transfer(signers[1].address, transferAmount)).to.be.revertedWith(
      'Equi::_transferTokens: transfer amount exceeds balance',
    );
  });

  it('Should SUCCESSFULLY transfer token', async function () {
    const transferAmount = 1000;
    const expectedBalance = '1000';

    const signers = await ethers.getSigners();
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    await equiToken.transfer(signers[1].address, transferAmount);
    const balance = await equiToken.balanceOf(signers[1].address);
    expect(balance.toString()).to.equal(expectedBalance);
  });

  it('Should SUCCESSFULLY delegate vote to another user', async function () {
    const transferAmount = 1000;
    const expectedCurrentVotes = '1000';

    const signers = await ethers.getSigners();
    const delegator = signers[1];
    const delegatee = signers[2];
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    // ensure delegator has some tokens
    await equiToken.transfer(delegator.address, transferAmount);

    // switch contract caller to delegator and delegate tokens to delegatee as votes
    await equiToken.connect(delegator).delegate(delegatee.address);

    const currentVotes = await equiToken.getCurrentVotes(delegatee.address);
    expect(currentVotes.toString()).to.equal(expectedCurrentVotes);
  });

  it('Should FAIL to fetch prior votes for an account if the specified blockNumber is greater than the current block.number of the blockchain', async function () {
    const transferAmount1 = 1000;
    const transferAmount2 = 100;
    let falsePriorBlockNumber;

    const signers = await ethers.getSigners();
    const delegator = signers[1];
    const delegatee = signers[2];
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    // ensure delegator has some tokens
    await equiToken.transfer(delegator.address, transferAmount1);

    // switch contract caller to delegator and delegate tokens to delegatee as votes
    const delegated = await equiToken.connect(delegator).delegate(delegatee.address);
    falsePriorBlockNumber = delegated.blockNumber + 10000; // increase the blockNumber significantly so that its greater than the current block number

    // transfer more tokens to delegator
    await equiToken.transfer(delegator.address, transferAmount2);

    // delegate newly assigned tokens to delegatee as votes
    await equiToken.connect(delegator).delegate(delegatee.address);

    await expect(
      equiToken.getPriorVotes(delegatee.address, falsePriorBlockNumber),
    ).to.be.revertedWith('Equi::getPriorVotes: not yet determined');
  });

  it('Should return ZERO as prior votes for an account if the specified blockNumber is behind the accounts initial checkpoint fromBlock', async function () {
    const transferAmount1 = 1000;
    const expectedPriorVotes = '0';
    let falsePriorBlockNumber;

    const signers = await ethers.getSigners();
    const delegator = signers[1];
    const delegatee = signers[2];
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    // ensure delegator has some tokens
    await equiToken.transfer(delegator.address, transferAmount1);

    // switch contract caller to delegator and delegate tokens to delegatee as votes
    const delegated = await equiToken.connect(delegator).delegate(delegatee.address);
    falsePriorBlockNumber = delegated.blockNumber - 10000; // reduce the blockNumber significantly so that is doesn't exist

    const priorVotes = await equiToken.getPriorVotes(delegatee.address, falsePriorBlockNumber);
    expect(priorVotes.toString()).to.equal(expectedPriorVotes);
  });

  it('Should SUCCESSFULLY fetch prior votes for an account at a specific block number', async function () {
    const transferAmount1 = 1000;
    const transferAmount2 = 100;
    const expectedPriorVotes = '1000';
    let priorBlockNumber;

    const signers = await ethers.getSigners();
    const delegator = signers[1];
    const delegatee = signers[2];
    const EquiToken = await ethers.getContractFactory('Equi');
    const equiToken = await EquiToken.deploy(signers[0].address);

    // ensure delegator has some tokens
    await equiToken.transfer(delegator.address, transferAmount1);

    // switch contract caller to delegator and delegate tokens to delegatee as votes
    const delegated = await equiToken.connect(delegator).delegate(delegatee.address);
    priorBlockNumber = delegated.blockNumber;

    // transfer more tokens to delegator
    await equiToken.transfer(delegator.address, transferAmount2);

    // delegate newly assigned tokens to delegatee as votes
    await equiToken.connect(delegator).delegate(delegatee.address);

    // get prior votes at blockNumber = priorBlockNumber
    const priorVotes = await equiToken.getPriorVotes(delegatee.address, priorBlockNumber);
    expect(priorVotes.toString()).to.equal(expectedPriorVotes);
  });
});

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { constants } from 'ethers';

describe('VestingWallet', function () {
  const tokenAddress = '0x42a472F3A494d4815ade185B1C90c8cFE8B3AF8B';
  const beneficiaryAddress = '0x546808575Ee7E2f508Ce429DE3960b674048CCd5';
  const startTimestamp = Math.floor(new Date().getTime() / 1000); // convert to seconds
  const durationSeconds = '126144000'; // four years
  const cliffSeconds = '15780000'; // 6 months
  const periodSeconds = '86400'; // daily

  it('Should FAIL to deploy contract with empty token address', async function () {
    const tokenAddress = constants.AddressZero;
    const VestingWallet = await ethers.getContractFactory('VestingWallet');

    expect(VestingWallet.deploy(tokenAddress)).to.be.revertedWith(
      'VestingWallet: Token address is zero address',
    );
  });

  it('Should FAIL to add empty beneficiary to vesting wallet', async function () {
    const beneficiaryAddress = constants.AddressZero;
    const VestingWallet = await ethers.getContractFactory('VestingWallet');
    const vestingWallet = await VestingWallet.deploy(tokenAddress);
    await vestingWallet.deployed();

    await expect(
      vestingWallet.vest(
        beneficiaryAddress,
        startTimestamp,
        durationSeconds,
        cliffSeconds,
        periodSeconds,
      ),
    ).to.be.revertedWith('VestingWallet: beneficiary is zero address');
  });

  it('Should SUCCESSFULLY add new beneficiary to vesting wallet', async function () {
    const VestingWallet = await ethers.getContractFactory('VestingWallet');
    const vestingWallet = await VestingWallet.deploy(tokenAddress);
    await vestingWallet.deployed();

    await vestingWallet.vest(
      beneficiaryAddress,
      startTimestamp,
      durationSeconds,
      cliffSeconds,
      periodSeconds,
    );

    expect(await vestingWallet.start(beneficiaryAddress)).to.equal(startTimestamp);
    expect(await vestingWallet.duration(beneficiaryAddress)).to.equal(durationSeconds);
    expect(await vestingWallet.released(beneficiaryAddress)).to.equal(0);
  });

  it('Should FAIL to release vested token - Next vesting period not reached', async function () {
    const VestingWallet = await ethers.getContractFactory('VestingWallet');
    const vestingWallet = await VestingWallet.deploy(tokenAddress);
    await vestingWallet.deployed();

    await vestingWallet.vest(
      beneficiaryAddress,
      startTimestamp,
      durationSeconds,
      cliffSeconds,
      periodSeconds,
    );

    await expect(vestingWallet.release(beneficiaryAddress)).to.be.revertedWith(
      'EQUITY DAO: Next vesting period not reached',
    );
  });

  it('Should FAIL to release vested token - No vested token available', async function () {
    const periodSeconds = 0; // start vesting immediately
    const cliffSeconds = 0; // no cliff

    const VestingWallet = await ethers.getContractFactory('VestingWallet');
    const vestingWallet = await VestingWallet.deploy(tokenAddress);
    await vestingWallet.deployed();

    await vestingWallet.vest(
      beneficiaryAddress,
      startTimestamp - 86400, // set startTimestamp to one day ago
      durationSeconds,
      cliffSeconds,
      periodSeconds,
    );

    expect(vestingWallet.release(beneficiaryAddress)).to.be.revertedWith(
      'EQUITY DAO: No vested token available',
    );
  });
});

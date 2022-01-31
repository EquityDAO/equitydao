import { expect } from 'chai';
import { ethers } from 'hardhat';
import { constants } from 'ethers';
import { namehash } from 'ethers/lib/utils';

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
    const transferAmount = 1000; // larger than 96 bits

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
});

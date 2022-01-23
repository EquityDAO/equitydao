import { expect } from 'chai';
import { ethers } from 'hardhat';
import { constants } from 'ethers';

describe('EquiNFT', function () {
  // use the hardcoded hash of keccak256('MINTER') instead of generating it on the fly since @ethersproject/keccak256 does not accept UTF-8 strings
  const MinterRoleHash = '0xf0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc9';

  const tokenAddress = '0x323ECA820b0f5508d5669C468a9F6159DF435fE4';
  const newTier = {
    tokenSize: 5,
    hashes: [
      '0xdA315762DfDcd488739d5a800D6E17C52f44e40b',
      '0xDEC65Efb23dB3c33363a3486232Ce5A6b0575F62',
      '0x2F006C1e5067ffF84D8b8B4dfAc79AFA30c0fa1f',
      '0x1f37D819D496689f0b2CA2219d8c9A4e283489c4',
      '0xe25e973D840BFB555431Be88a868D0C5DdD6eEE6',
    ],
    mpPercentage: 100,
  };

  it('Should FAIL to initialize contract with empty token address', async function () {
    const signers = await ethers.getSigners();
    const EquiNFT = await ethers.getContractFactory('EquiNFT');
    const equiNFT = await EquiNFT.deploy();
    const tokenAddress = constants.AddressZero;

    await expect(equiNFT.initialize([signers[0].address], tokenAddress)).to.be.revertedWith(
      'EquiNFT: Token address is zero address',
    );
  });

  it('Should SUCCESSFULLY initialize contract', async function () {
    const signers = await ethers.getSigners();
    const EquiNFT = await ethers.getContractFactory('EquiNFT');
    const equiNFT = await EquiNFT.deploy();

    await equiNFT.initialize([signers[0].address], tokenAddress);

    expect(await equiNFT.getTokenAddress()).to.equal(tokenAddress);
    expect(await equiNFT.contractURI()).to.equal('QmWAfQFFwptzRUCdF2cBFJhcB2gfHJMd7TQt64dZUysk3R');
    expect(await equiNFT.hasRole(MinterRoleHash, signers[0].address)).to.equal(true);
  });

  it('Should FAIL to add a new Tier when called by non minter', async function () {
    const signers = await ethers.getSigners();
    const EquiNFT = await ethers.getContractFactory('EquiNFT');
    const equiNFT = await EquiNFT.deploy();

    await equiNFT.initialize([signers[0].address], tokenAddress); // adds signer[0] as a minter
    // connect to an address that isn't a minter address and make call
    await expect(equiNFT.connect(signers[1]).addTier(newTier)).to.be.revertedWith(
      'EquiNFT: not minter',
    );
  });

  it('Should SUCCESSFULLY add a new Tier when called by a minter', async function () {
    const signers = await ethers.getSigners();
    const EquiNFT = await ethers.getContractFactory('EquiNFT');
    const equiNFT = await EquiNFT.deploy();

    await equiNFT.initialize([signers[0].address], tokenAddress); // adds signer[0] as a minter
    await equiNFT.addTier(newTier); // ethers.js uses signers[0] as {from} address by default

    const tier = await equiNFT.getTier(0);

    expect(tier.tokenSize).to.equal(newTier.tokenSize);
    expect(tier.hashes).to.have.lengthOf(newTier.hashes.length);
    expect(tier.mpPercentage).to.equal(newTier.mpPercentage);
  });

  it('Should FAIL to mint a new token when called by non minter', async function () {
    const signers = await ethers.getSigners();
    const EquiNFT = await ethers.getContractFactory('EquiNFT');
    const equiNFT = await EquiNFT.deploy();

    await equiNFT.initialize([signers[0].address], tokenAddress); // adds signer[0] as a minter
    await equiNFT.addTier(newTier); // ethers.js uses signers[0] as {from} address by default

    // connect to an address that isn't a minter address and make call
    await expect(equiNFT.connect(signers[1]).mint(0, signers[1].address)).to.be.revertedWith(
      'EquiNFT: not minter',
    );
  });

  it('Should SUCCESSFULLY mint a new token', async function () {
    const signers = await ethers.getSigners();
    const EquiNFT = await ethers.getContractFactory('EquiNFT');
    const equiNFT = await EquiNFT.deploy();

    await equiNFT.initialize([signers[0].address], tokenAddress); // adds signer[0] as a minter
    await equiNFT.addTier(newTier); // ethers.js uses signers[0] as {from} address by default
    await equiNFT.mint(0, signers[0].address);

    const tokens = await equiNFT.getOwnedTokens(signers[0].address);

    expect(tokens).to.have.lengthOf(1);
    expect(tokens[0]).to.equal(0);
  });
});

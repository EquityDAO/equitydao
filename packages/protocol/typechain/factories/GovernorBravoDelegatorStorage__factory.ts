/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";

import type { GovernorBravoDelegatorStorage } from "../GovernorBravoDelegatorStorage";

export class GovernorBravoDelegatorStorage__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<GovernorBravoDelegatorStorage> {
    return super.deploy(
      overrides || {}
    ) as Promise<GovernorBravoDelegatorStorage>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): GovernorBravoDelegatorStorage {
    return super.attach(address) as GovernorBravoDelegatorStorage;
  }
  connect(signer: Signer): GovernorBravoDelegatorStorage__factory {
    return super.connect(signer) as GovernorBravoDelegatorStorage__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GovernorBravoDelegatorStorage {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as GovernorBravoDelegatorStorage;
  }
}

const _abi = [
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060fd8061001f6000396000f3fe6080604052348015600f57600080fd5b5060043610603c5760003560e01c8063267822471460415780635c60da1b146089578063f851a4401460a8575b600080fd5b60015460609073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390f35b60025460609073ffffffffffffffffffffffffffffffffffffffff1681565b60005460609073ffffffffffffffffffffffffffffffffffffffff168156fea264697066735822122081c09471d7bb2fc155c9463d8354208da8657d00d902c69f254a2c76c96d162a64736f6c63430008060033";

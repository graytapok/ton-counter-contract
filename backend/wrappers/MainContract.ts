import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  SendMode,
  Sender,
} from "@ton/core";

export type MainContractConfig = {
  number: number;
  address: Address;
  owner_address: Address;
};

export const mainContractConfigToCell = (config: MainContractConfig) => {
  return beginCell()
    .storeUint(config.number, 32)
    .storeAddress(config.address)
    .storeAddress(config.owner_address)
    .endCell();
};

export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = mainContractConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new MainContract(address, init);
  }

  async sendIncrement(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    increment_by: number
  ) {
    const msgBody = beginCell()
      .storeUint(1, 32)
      .storeUint(increment_by, 32)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }

  async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const msgBody = beginCell()
      .storeUint(2, 32) // * OP Code
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }

  async sendNoCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const msgBody = beginCell().endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }

  async sendWithdrawal(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    amount: bigint
  ) {
    const msgBody = beginCell()
      .storeUint(3, 32) // * OP Code
      .storeCoins(amount)
      .endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody,
    });
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage_data", []);
    return {
      number: stack.readNumber(),
      recentSender: stack.readAddress(),
      ownerAddress: stack.readAddress(),
    };
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", []);
    return {
      number: stack.readNumber(),
    };
  }
}

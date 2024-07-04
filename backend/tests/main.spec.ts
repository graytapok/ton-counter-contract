import { Cell, toNano } from "@ton/core";
import { hex } from "../build/main.compiled.json";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { MainContract } from "../wrappers/MainContract";
import { compile } from "@ton/blueprint";
import "@ton/test-utils";

describe("main.fc", () => {
  let blockchain: Blockchain;
  let myContract: SandboxContract<MainContract>;
  let initWallet: SandboxContract<TreasuryContract>;
  let ownerWallet: SandboxContract<TreasuryContract>;
  let codeCell: Cell;

  beforeAll(async () => {
    codeCell = await compile("MainContract");
  });

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWallet = await blockchain.treasury("initWallet");
    ownerWallet = await blockchain.treasury("ownerWallet");

    myContract = blockchain.openContract(
      MainContract.createFromConfig(
        {
          number: 0,
          address: initWallet.address,
          owner_address: ownerWallet.address,
        },
        codeCell
      )
    );
  });

  it("should get the proper most recent sender address", async () => {
    const senderWallet = await blockchain.treasury("sender");

    const sentMessageResult = await myContract.sendIncrement(
      senderWallet.getSender(),
      toNano("0.05"),
      1
    );

    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const data = await myContract.getData();

    expect(data.recentSender.toString()).toBe(senderWallet.address.toString());
    expect(data.number).toEqual(1);
  });

  it("successfully deposit funds", async () => {
    const senderWallet = await blockchain.treasury("senderWallet");

    const depositMessageResult = await myContract.sendDeposit(
      senderWallet.getSender(),
      toNano("5")
    );

    expect(depositMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const balanceRequest = await myContract.getBalance();

    expect(balanceRequest.number).toBeGreaterThan(toNano("4.99"));
  });

  it("should return deposit funds as no command is sent", async () => {
    const senderWallet = await blockchain.treasury("senderWallet");

    const depositMessageResult = await myContract.sendNoCodeDeposit(
      senderWallet.getSender(),
      toNano("5")
    );

    expect(depositMessageResult.transactions).toHaveTransaction({
      from: myContract.address,
      to: senderWallet.address,
      success: true,
    });

    const balanceRequest = await myContract.getBalance();

    expect(balanceRequest.number).toBe(0);
  });

  it("successfully withdraws fund on behalf of owner", async () => {
    const senderWallet = await blockchain.treasury("senderWallet");

    await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

    const withdrawalMessageResult = await myContract.sendWithdrawal(
      ownerWallet.getSender(),
      toNano("0.05"),
      toNano("1")
    );

    expect(withdrawalMessageResult.transactions).toHaveTransaction({
      from: myContract.address,
      to: ownerWallet.address,
      success: true,
      value: toNano(1),
    });
  });

  it("fails to withdraw funds on behalf of non-owner", async () => {
    const senderWallet = await blockchain.treasury("senderWallet");

    await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

    const withdrawalMessageResult = await myContract.sendWithdrawal(
      senderWallet.getSender(),
      toNano("0.05"),
      toNano("1")
    );

    expect(withdrawalMessageResult.transactions).toHaveTransaction({
      to: myContract.address,
      from: senderWallet.address,
      success: false,
      exitCode: 403,
    });
  });

  it("fails to withdraw fund because lack of balance", async () => {
    const withdrawalMessageResult = await myContract.sendWithdrawal(
      ownerWallet.getSender(),
      toNano("0.05"),
      toNano("1")
    );

    expect(withdrawalMessageResult.transactions).toHaveTransaction({
      from: ownerWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 409,
    });
  });
});

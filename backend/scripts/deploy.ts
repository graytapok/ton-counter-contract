import { address, toNano } from "@ton/core";
import { MainContract } from "../wrappers/MainContract";
import { compile, NetworkProvider } from "@ton/blueprint";

export const run = async (provider: NetworkProvider) => {
  const myContract = MainContract.createFromConfig(
    {
      number: 0,
      address: address("EQDFk2_71VUvBW-F2wiz6ZqyapFnCPAtyL3jph1U_kvmYoWS"),
      owner_address: address(
        "EQDFk2_71VUvBW-F2wiz6ZqyapFnCPAtyL3jph1U_kvmYoWS"
      ),
    },
    await compile("MainContract")
  );

  const oponendContract = provider.open(myContract);

  oponendContract.sendDeploy(provider.sender(), toNano("0.05"));

  await provider.waitForDeploy(myContract.address);
};

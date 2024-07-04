import { Address } from "@ton/core";

const convertAdress = (address: string) => {
  return Address.parse(`0:${address}`).toString();
};

const address = convertAdress(
  "a3935861f79daf59a13d6d182e1640210c02f98e3df18fda74b8f5ab141abf18"
);

console.log(address);

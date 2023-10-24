const { ethers } = require("ethers");
const {
  DefenderRelaySigner,
  DefenderRelayProvider,
} = require("@openzeppelin/defender-relay-client/lib/ethers");

exports.handler = async function (data) {
  const payload = data.request.body.events;

  const provider = new DefenderRelayProvider(data);

  const signer = new DefenderRelaySigner(data, provider, {speed: "fast"});

  var onlyEvents = payload[0].matchReasons.filter((e) => e.type === "event");
  if(onlyEvents.length === 0) return;

  var event = onlyEvents.filter((ev) => 
  ev.signature.includes("Burn"));

  var {account, id} = event[0].params;

  //Address del token BBites
  var BBitesTokenAdd = "0x65b539D24ebFDcb9A6a127e335f184C5FFb6d1f1";
  var tokenAbi = ["function mint(address to, uint256 amount)"];
  var tokenContract = new ethers.Contract(BBitesTokenAdd, tokenAbi, signer);
  var mintTokentx = await tokenContract.mint(account, 10000 * 10 ** 18);
  var res = await mintTokentx.wait();
  return res;
};

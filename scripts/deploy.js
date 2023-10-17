require("dotenv").config();

const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const { getRootFromMT } = require("../utils/merkleTree");

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

// verificando SC NO UPGRADEABLE

async function verifyNoUp(contract) {

if (
  !!process.env.HARDHAT_NETWORK &&
  process.env.HARDHAT_NETWORK != "localhost"
) {
  // HARDHAT_NETWORK: mumbai
  // HARDHAT_NETWORK: $ npx hardhat --network [HARDHAT_NETWORK] run script/deploy.js
  var res = await contract.waitForDeployment();
  await res.deploymentTransaction().wait(10);
}

if (
  !!process.env.HARDHAT_NETWORK &&
  process.env.HARDHAT_NETWORK != "localhost"
) {
  // hre: no se declara porque el comando crea un contexto de hardhat donde injecta esa variables
  await hre.run("verify:verify", {
    address: await contract.getAddress(),
    constructorArguments: [],
  });
}
}

// Publicar NFT en Mumbai
async function deployMumbai() {
  var relAddMumbai = "0x08C3753774057746aeC99427e8545727d8317DF9"; // relayer mumbai ((CAMBIAR !!))

  // utiliza deploySC
  var proxyContract = await deploySC("CuyCollectionNft", []);
  
  // utiliza printAddress
  var implementationAddressNft = await printAddress("CuyCollectionNft",await proxyContract.getAddress());
  //var root = getRootFromMT();
  // utiliza ex
  await ex(proxyContract, "updateRoot", [getRootFromMT()], "Failed");
  // utiliza ex
  await ex(proxyContract, "grantRole", [ MINTER_ROLE, relAddMumbai], "Failed");
  // utiliza verify
  await verify(implementationAddressNft, "CuyCollectionNft",[]);

}

// Publicar UDSC y Bbites Token en Goerli
async function deployTokensGoerli() {
  //var relAddGoerli; // relayer goerli


  // var bbitesToken Contrato
  // deploySC;
  var bbitesTokenContract = await deploySC("BBitesTokenUpgradeable", []);
  

  // var impBT = await printAddress("BBitesToken", await bbitesToken.getAddress());
  var impBT = await printAddress("BBitesTokenUpgradeable", await bbitesTokenContract.getAddress());


  
  // var usdc Contrato
  // deploySC;
  var usdcContract = await deploySCNoUp("USDCoin", []);
  
  // set up
  await ex(bbitesTokenContract, "grantRole", [MINTER_ROLE, relAddGoerli], "Failed");

  // script para verificacion del contrato
  
  await verify(impBT, "BBitesTokenUpgradeable", []);

  await verifyNoUp(usdcContract);
  
  
}

// Publicar Public Sale

async function deployPSGoerli() {
  
  
  // var psC Contrato
  // deploySC;
  var psContract = await deploySC("PublicSale", []);
  
  // var impPS = await printAddress("PublicSale", await psC.getAddress());
  var impPS = await printAddress("PublicSale", await psContract.getAddress());
  
  //
  
  await verify(impPS, "PublicSale", []);
}

 deployMumbai()
// deployTokensGoerli()
// deployPSGoerli()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

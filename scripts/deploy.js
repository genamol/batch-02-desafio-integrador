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

// Publicar NFT en Mumbai
async function deployMumbai() {
  var relAddMumbai; // relayer mumbai
  var name = "Mol NFTs";
  var symbol = "MOL";

  // utiliza deploySC
  var proxyContract = await deploySC("CuyCollectionNft", [name, symbol]);
  
  // utiliza printAddress
  var implementationAddressNft = await printAddress("CuyCollectionNft", await proxyContract.getAddress());
  // utiliza ex
  await ex("CuyCollectionNft", "updateRoot", [getRootFromMT], "Failed");
  // utiliza ex
  await ex("CuyCollectionNft", "grantRole", [ MINTER_ROLE, relAddMumbai], "Failed");
  // utiliza verify
  await verify(implementationAddressNft, "CuyCollectionNft",[]);

  await verify(implAdd, "CUYNFT");
}

// Publicar UDSC, Public Sale y Bbites Token en Goerli
async function deployTokensGoerli() {
  var relAddGoerli; // relayer goerli

  
  // var bbitesToken Contrato
  // deploySC;
  var bbitesTokenContract = deploySC("BBitesTokenUpgradeable", ["BBites Token", "BBTKN"]);
  
  // var usdc Contrato
  // deploySC;
  var usdcContract = deploySCNoUp("USDCoin", ["USD Coin", "USDC"]);
  
  // var impBT = await printAddress("BBitesToken", await bbitesToken.getAddress());
  var impBT = await printAddress("BBitesTokenUpgradeable", await bbitesTokenContract.getAddress());
  // set up
  await ex("BBitesTokenUpgradeable", "grantRole", [( MINTER_ROLE, relAddGoerli)], "Failed");
  // script para verificacion del contrato
  
  await verify(impBT, "BBitesTokenUpgradeable", ["BBites Token", "BBTKN"]);

  await verify(usdcContract, "USDCoin", ["USD Coin", "USDC"]);
  
  
}


async function deployPSGoerli() {
  
  
  // var psC Contrato
  // deploySC;
  var psContract = await deploySC("PublicSale", []);
  
  // var impPS = await printAddress("PublicSale", await psC.getAddress());
  var impPS = await printAddress("PublicSale", await psContract.getAddress());
  
  
  await verify(impPS, "PublicSale", []);
}

// deployMumbai()
 deployTokensGoerli()
// deployPSGoerli()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

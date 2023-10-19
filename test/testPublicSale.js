var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;
describe("Testeando Public Sale", () => {

var PublicSale, publicsale;

async function deployFixture() {  

    var [owner, alice, bob, carl] = await ethers.getSigners();

    PublicSale = await hre.ethers.getContractFactory("PublicSale");
    publicsale = await hre.upgrades.deployProxy(PublicSale, {
        kind: "uups",
      });
      var implementationAddress =
      await hre.upgrades.erc1967.getImplementationAddress(
        publicsale.target
      );
    
   // owner.address.MINTER_ROLE;
    return { publicsale, owner, alice, bob, carl};
  }



  
//**      it("Publicando los contarto inteligentes", async () => {
//        PublicSale = await hre.ethers.getContractFactory(
//          "CuyCollectionNft"
//        );
//        publicsale = await hre.upgrades.deployProxy(PublicSale, {
//          kind: "uups",
//        });
//  
//        var implementationAddress =
//          await hre.upgrades.erc1967.getImplementationAddress(
//            publicsale.target
//          );
  
//        console.log(`El address del Proxy es ${publicsale.target}`);
//        console.log(`El address de Implementation es ${implementationAddress}`);
        
 //           return {publicsale};
//        });

describe("Testeando Roles", () => {
        it("SafeMint protegido con MINTER_ROLE", async () => {
            
            var [publicsale, owner, alice, bob, carl] = await loadFixture(deployFixture);

            const safemint = publicsale.connect(alice)["safeMint(address,uint256"];

            var aliceMinuscula = alice.address.toLowerCase();

            await expect(
                safemint(bob.address, 10)
                ).to.revertedWith(
                `AccessControl: account ${aliceMinuscula} is missing role ${MINTER_ROLE}`);

        });})

});

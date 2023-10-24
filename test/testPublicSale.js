var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers, network } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth, printAddress } = require("../utils");
const { construyendoPruebas, getRootFromMT } = require("../utils/merkleTree");
const { id } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");


const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;
describe("Testeando Public Sale", () => {

var routerAdd;
var usdc;
var BBTkn, bbtknProxy;
var PublicSale, publicsaleProxy;

async function deployFixture() {  

    var [owner, alice, bob, carl] = await ethers.getSigners();

    usdc = await deploySCNoUp("USDCoin", []);

    bbtknProxy = await deploySC("BBitesTokenUpgradeable", []);

    publicsaleProxy = await deploySC("PublicSale", []);

    return { publicsaleProxy, bbtknProxy, usdc, owner, alice, bob, carl};
  }



describe("Publicando los contratos inteligentes", () => {

  it("Publicando USDCoin", async () => {

    usdc = await deploySCNoUp("USDCoin", []);
        
        return {usdc};
      });
      
  
  
  it("Publicando BBitesToken", async () => {
    BBTkn = await hre.ethers.getContractFactory(
      "BBitesTokenUpgradeable"
      );
      bbtknProxy = await hre.upgrades.deployProxy(BBTkn, {
        kind: "uups",
      });
      
      var implementationAddress =
      await hre.upgrades.erc1967.getImplementationAddress(
        bbtknProxy.target
        );
        
        console.log(`El address del Proxy es ${bbtknProxy.target}`);
        console.log(`El address de Implementation es ${implementationAddress}`);
        
        return {bbtknProxy};
      });
      
    
    
    
    it("Publicando PublicSale", async () => {
     PublicSale = await hre.ethers.getContractFactory(
       "PublicSale"
     );
     publicsaleProxy = await hre.upgrades.deployProxy(PublicSale, {
       kind: "uups",
     });
  
     var implementationAddress =
       await hre.upgrades.erc1967.getImplementationAddress(
         publicsaleProxy.target
       );
  
     console.log(`El address del Proxy es ${publicsaleProxy.target}`);
     console.log(`El address de Implementation es ${implementationAddress}`);
      
         return {publicsaleProxy};
     });

    });
    


describe("Testeando purchaseWithTokens", () => {
        it("El NFT ID debe estar entre 0 - 699", async () => {
            
            var { publicsaleProxy, bbtknProxy, usdc, owner, alice, bob, carl } = await loadFixture(deployFixture);

            var incorrectId = 750;


            await expect(
                publicsaleProxy.connect(owner).purchaseWithTokens(incorrectId)
                ).to.revertedWith(
                "Invalid NFT ID");

        });
        
        it("El NFT no puede mintearse mas de una vez", async () => {
          
          var { publicsaleProxy, bbtknProxy, usdc, owner, alice, bob, carl } = await loadFixture(deployFixture);
          
          var id = 500;

          await publicsaleProxy.connect(owner).purchaseWithTokens(id);

          await expect(
            publicsaleProxy.connect(owner).purchaseWithTokens(id)
            ).to.revertedWith(
            "Este Id NFT ya fue minteado"
          );
        });
      
      
      });


    
    
      describe("Testeando purchaseWithUSDC", () => {
       
       
        it("El NFT ID debe estar entre 0 - 699", async () => {
            
          var { publicsaleProxy, bbtknProxy, usdc, owner, alice, bob, carl } = await loadFixture(deployFixture);

          var incorrectId = 750;

          var amount = 1000;

          await expect(
              publicsaleProxy.connect(owner).purchaseWithUSDC(incorrectId, amount)
              ).to.revertedWith(
              "Invalid NFT ID");

      });
      
      it("El NFT no puede mintearse mas de una vez", async () => {
        
        var { publicsaleProxy, bbtknProxy, usdc, owner, alice, bob, carl } = await loadFixture(deployFixture);
        
        var id = 500;
        var amount = 1000;

        await publicsaleProxy.connect(owner).purchaseWithUSDC(id, amount);

        await expect(
          publicsaleProxy.connect(owner).purchaseWithUSDC(id, amount)
          ).to.revertedWith(
          "Este Id NFT ya fue minteado"
        );
      });

      it("Lanzando evento" , async () => {
        var { publicsaleProxy, owner, alice } = await loadFixture(deployFixture);
        var tokenId = 777;
        var amount = 1000;

        await expect(
          publicsaleProxy.connect(alice).purchaseWithUSDC(tokenId, amount)
          ).to.emit(publicsaleProxy, "PurchaseNftWithId").withArgs(alice.address, tokenId);
    });


      });

      describe("Testeando purchaseWithEtherAndId", () => {
        it("Lanzando event", async () => {
          var { publicsaleProxy, owner, alice } = await loadFixture(deployFixture);
          var tokenId = 777;
          var amount = ethers.parseEther("0.01");

          await expect(
            publicsaleProxy.connect(alice).purchaseWithEtherAndId(tokenId, {value: amount})
            ).to.emit(publicsaleProxy, "PurchaseNftWithId").withArgs(alice.address, tokenId);
      });
      });


});

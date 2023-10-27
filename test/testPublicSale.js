var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers, network } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth, printAddress } = require("../utils");
const { construyendoPruebas, getRootFromMT } = require("../utils/merkleTree");
const { id } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

// UNISWAP
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const WETH9 = require("../WETH9.json");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;
describe("Testeando Public Sale", () => {

var routerAdd;
var usdc;
var BBTkn, bbtknProxy;
var PublicSale, publicsaleProxy;

var pEth = ethers.parseEther;
var TOKENS = pEth("100000");

async function deployFixture() {  

    var [owner, alice, bob, carl] = await ethers.getSigners();

    // UNISWAP
    var Factory = new ethers.ContractFactory(
      factoryArtifact.abi,
      factoryArtifact.bytecode,
      owner
    );
    var factory = await Factory.deploy(owner.address);

    usdc = await deploySCNoUp("USDCoin", []);
    var usdcAdd = await usdc.getAddress();

    bbtknProxy = await deploySC("BBitesTokenUpgradeable", []);
    var bbtknAdd = await bbtknProxy.getAddress();

        // UNISWAP
        var Weth = new ethers.ContractFactory(WETH9.abi, WETH9.bytecode, owner);
        var weth = await Weth.deploy();
        await factory.createPair(bbtknProxy.target, usdc.target);
        var pairAddress = await factory.getPair(bbtknProxy.target, usdc.target);
        var pair = new ethers.Contract(pairAddress, pairArtifact.abi, owner);
        var Router = new ethers.ContractFactory(
          routerArtifact.abi,
          routerArtifact.bytecode,
          owner
        );
        var router = await Router.deploy(factory.target, weth.target);
    
        //var routerAdd = await router.getAddress();
        var routerAdd = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

        await bbtknProxy.approve(router, bbtknProxy.balanceOf(owner));
        await usdc.approve(router, usdc.balanceOf(owner));
        await router.addLiquidity(
          bbtknProxy.target,
          usdc.target,
          bbtknProxy.balanceOf(owner),
          usdc.balanceOf(owner),
          0,
          0,
          owner,
          Math.floor(Date.now() / 1000 + 10 * 60)
        );

    publicsaleProxy = await deploySC("PublicSale", [bbtknAdd, usdcAdd]);

    return { publicsaleProxy, bbtknProxy, usdc, pair, routerAdd, owner, alice, bob, carl};
  }



describe("Publicando los contratos inteligentes", () => {

  it("Publicando USDCoin, BBitesToken y PublicSale", async () => {

    usdc = await deploySCNoUp("USDCoin", []);
    
    var usdcAdd = await usdc.getAddress();

    BBTkn = await hre.ethers.getContractFactory(
      "BBitesTokenUpgradeable"
      );
      bbtknProxy = await hre.upgrades.deployProxy(BBTkn, {
        kind: "uups",
      });

      var bbtknAdd = await bbtknProxy.getAddress();
      
      var implementationAddress =
      await hre.upgrades.erc1967.getImplementationAddress(
        bbtknProxy.target
        );
        
        console.log(`El address del Proxy es ${bbtknProxy.target}`);
        console.log(`El address de Implementation es ${implementationAddress}`);
        
           
     PublicSale = await hre.ethers.getContractFactory(
       "PublicSale"
     );
     publicsaleProxy = await hre.upgrades.deployProxy(PublicSale, [bbtknAdd, usdcAdd], {
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


  it("Acuña tokens en la cuenta Alice", async function () {
    var { alice, bbtknProxy } = await loadFixture(deployFixture);
    await bbtknProxy.mint(alice.address, TOKENS);
    var balanceAlice = await bbtknProxy.balanceOf(alice.address);
    expect(balanceAlice).to.be.equal(
      TOKENS,
      "No se hizo el mint correctamente"
    );
  });

     it("Approve correcto", async () => {
    var { alice, bbtknProxy, publicsaleProxy } = await loadFixture(deployFixture);
    await bbtknProxy.connect(alice).approve(publicsaleProxy, TOKENS);

    var allowance = await bbtknProxy.allowance(alice.address, publicsaleProxy);
    expect(allowance).to.be.equal(TOKENS, "No se hizo el approve correctamente");
})  


        it("El NFT ID debe estar entre 0 - 699", async () => {
            
            var { publicsaleProxy, bbtknProxy, usdc, pair, routerAdd, owner, alice, bob, carl } = await loadFixture(deployFixture);

            var incorrectId = 750;


            await expect(
                publicsaleProxy.connect(owner).purchaseWithTokens(incorrectId)
                ).to.revertedWith(
                "Invalid NFT ID");

        });
        
        it("El NFT no puede mintearse mas de una vez", async () => {
          
          var { publicsaleProxy, bbtknProxy, usdc, pair, routerAdd, owner, alice, bob, carl } = await loadFixture(deployFixture);
          
          var id = 500;

          var price = await publicsaleProxy.valueNftTokenAndUsdc(id);

          await bbtknProxy.mint(owner.address, TOKENS);

          await bbtknProxy.connect(owner).approve(publicsaleProxy.getAddress(), price);

          await publicsaleProxy.connect(owner).purchaseWithTokens(id);

          await bbtknProxy.connect(owner).approve(publicsaleProxy.getAddress(), price);

          await expect(
            publicsaleProxy.connect(owner).purchaseWithTokens(id)
            ).to.revertedWith(
            "Este Id NFT ya fue minteado"
          );
        });

        it("Compra el token correctamente", async function () {
          var { alice, bbtknProxy, publicsaleProxy } = await loadFixture(
            deployFixture
          );
    
          await bbtknProxy.mint(alice.address, TOKENS);
          await bbtknProxy.connect(alice).approve(publicsaleProxy.getAddress(), TOKENS);
          var tx = await publicsaleProxy.connect(alice).purchaseWithTokens(2);
          expect(tx).to.emit(publicsaleProxy, "PurchaseNftWithId");
        });
      
      
      });


    
    
      describe("Testeando purchaseWithUSDC", () => {
       
       
        it("El NFT ID debe estar entre 0 - 699", async () => {
            
          var { publicsaleProxy, bbtknProxy, usdc, pair, routerAdd, owner, alice, bob, carl } = await loadFixture(deployFixture);

          var incorrectId = 750;

          var amount = 1000;

          await expect(
              publicsaleProxy.connect(owner).purchaseWithUSDC(incorrectId, amount)
              ).to.revertedWith(
              "Invalid NFT ID");

      });
      
      it("El NFT no puede mintearse mas de una vez", async () => {
        
        var { publicsaleProxy, bbtknProxy, usdc, pair, routerAdd, owner, alice, bob, carl } = await loadFixture(deployFixture);
        
        var id = 500;
        var amount = 1000;

        var price = await publicsaleProxy.valueNftTokenAndUsdc(id);

        await usdc.mint(owner.address, amount);

        await usdc.connect(owner).approve(publicsaleProxy.target, price);

        await publicsaleProxy.connect(owner).purchaseWithUSDC(id, amount);

        await usdc.connect(owner).approve(publicsaleProxy.target, price);

        await expect(
          publicsaleProxy.connect(owner).purchaseWithUSDC(id, amount)
          ).to.revertedWith(
          "Este Id NFT ya fue minteado"
        );
      });

      it("Lanzando evento" , async () => {
        var { publicsaleProxy, bbtknProxy, usdc, pair, routerAdd, owner, alice, bob, carl } = await loadFixture(deployFixture);
        var id = 350;
        var amount = 1000;
        var price = await publicsaleProxy.valueNftTokenAndUsdc(id);

        await usdc.mint(alice.address, amount);
        await usdc.connect(alice).approve(publicsaleProxy.target, price);

        await expect(
          publicsaleProxy.connect(alice).purchaseWithUSDC(id, amount)
          ).to.emit(publicsaleProxy, "PurchaseNftWithId").withArgs(alice.address, id);
    });


      });

      describe("Testeando purchaseWithEtherAndId", () => {
        it("Comprando con cant de ether incorrecta", async () => {
          var {publicsaleProxy, alice } = await loadFixture(deployFixture);
          
          await expect(
            publicsaleProxy.connect(alice).purchaseWithEtherAndId(703, {value: ethers.parseEther("0.02")})
            ).to.be.reverted;
      });

      it("Purchase with usdc numero invalido", async () => {
        var {publicsaleProxy, alice} = await loadFixture(deployFixture);
        var numeroInvalido = 2710;

        await expect(publicsaleProxy.connect(alice).purchaseWithEtherAndId(numeroInvalido)).to.be.reverted;
    });

        it("Lanzando event", async () => {
          var { publicsaleProxy, owner, alice } = await loadFixture(deployFixture);
          var bbtknProxyId = 777;
          var amount = ethers.parseEther("0.01");

          await expect(
            publicsaleProxy.connect(alice).purchaseWithEtherAndId(bbtknProxyId, {value: amount})
            ).to.emit(publicsaleProxy, "PurchaseNftWithId").withArgs(alice.address, bbtknProxyId);
      });
      });

      describe("Purchase whit ether ramdon", async () => {
        it("Comprando con cant de ether incorrecta", async () => {
            var {publicsaleProxy, alice } = await loadFixture(deployFixture);

            var tx = alice.sendTransaction({
                to: publicsaleProxy.getAddress(),
                value: ethers.parseEther("0.001")
            });
            await expect(tx).to.be.reverted;
        });

        it("Comprando con cant de ether correcta", async () => {
            var {publicsaleProxy, alice } = await loadFixture(deployFixture);

            var amount = ethers.parseEther("0.01");

            var tx = alice.sendTransaction({
                to: publicsaleProxy.getAddress(),
                value: amount
            });

            await expect(tx).to.emit(publicsaleProxy, "PurchaseNftWithId");
        });
    });

});

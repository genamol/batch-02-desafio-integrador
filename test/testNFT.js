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

const ONE_ETHER = `0x${ethers.parseEther("1").toString(16)}`;

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;
describe("Testeando Mol Collection NFTs", () => {

var CuyCollectionNFT, cuycollectionnft;

async function deployFixture() {  
    
    var [owner, alice, bob, carl] = await ethers.getSigners();
    
    cuycollectionnft = await deploySC("CuyCollectionNft", []);


     var implementationAddress = await printAddress("CuyCollectionNft", await cuycollectionnft.getAddress());
        

        return { cuycollectionnft, owner, alice, bob, carl};
    }
    
    
    
    
          it("Publicando los contarto inteligentes", async () => {
                CuyCollectionNFT = await hre.ethers.getContractFactory(
                      "CuyCollectionNft"
                    );
                    cuycollectionnft = await hre.upgrades.deployProxy(CuyCollectionNFT, {
                          kind: "uups",
                        });
             
                        var implementationAddress =
                          await hre.upgrades.erc1967.getImplementationAddress(
                                cuycollectionnft.target
                              );
                    
                            console.log(`El address del Proxy es ${cuycollectionnft.target}`);
                            console.log(`El address de Implementation es ${implementationAddress}`);
                    
                               return {cuycollectionnft};
                            });
                    
        describe("Testeando Roles", () => {
           it("SafeMint protegido con MINTER_ROLE", async () => {
                            
                var {cuycollectionnft, owner, alice, bob, carl} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner.address);                          
                var aliceMinuscula = alice.address.toLowerCase();
                            
                await expect(
                        cuycollectionnft.connect(alice).safeMint(bob.address, 10)
                        ).to.revertedWith(
                            `AccessControl: account ${alice.address.toLowerCase()} is missing role ${MINTER_ROLE}`);
                             
        });});

        describe("Testeando que el ID sea correcto", () => {

            it("El ID debe estar entre 0 - 999 en safeMint", async () => {

                var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner.address);
                var incorrectId = 1500;
                await expect(
                    cuycollectionnft.connect(owner).safeMint(bob.address, incorrectId)
                ).to.revertedWith(
                    "Invalid NFT ID"
                );
            });


            it("El ID debe estar entre 1000 - 1999 en safeMintWhiteList", async () => {

                var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner.address);
                var incorrectId = 300;
                var account = "0xC840F562D9F69b46b4227003E01525CB99344B72";
                var privateKey = "0x6e02fc34a5301d5d29825f05c1499333c3007a53454a14f0260cdf84e741426f";
                await network.provider.send("hardhat_setBalance", [
                    account,
                    ONE_ETHER
                ]);
                var signerAccount = new ethers.Wallet(privateKey, ethers.provider);
                var root = getRootFromMT();
                var proofs = await construyendoPruebas(incorrectId, account);

                await expect(
                    cuycollectionnft.connect(signerAccount).safeMintWhiteList(account, incorrectId, proofs)
                ).to.revertedWith(
                    "Invalid NFT ID"
                );
            });




            it("El NFT no puede mintearse mas de una vez", async () => {
                var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner.address);
                var id = 200;
                await cuycollectionnft.connect(owner).safeMint(alice.address, id);
                await expect(
                    cuycollectionnft.connect(owner).safeMint(bob.address, id)
                ).to.revertedWith(
                    "Este Id NFT ya fue minteado"
                );
            });
        }) ;








       describe("Testeando que el address pertenezca a la WhiteList", () => {


           it("La direccion del comprador no esta en la whitelist para safeMintWhiteList", async () => {
               var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
               await cuycollectionnft.grantRole(MINTER_ROLE, owner.address);
               var zurda = "0x5bc25fa42c71c2E1f8cEc0d769d1ed52c555e884"
               var account = zurda;
             var privateKeyZurda = "f94872efc19094c45e1c00aeb3a631eaa39b5c5b03279ffb869327823baf3485"
               var privateKey = privateKeyZurda;
               await network.provider.send("hardhat_setBalance", [
                   account,
                   ONE_ETHER
               ]);
               var signerAccount = new ethers.Wallet(privateKey, ethers.provider);
               var root = getRootFromMT();
               var proofs = await construyendoPruebas(1000 , account);
               await expect(
                   cuycollectionnft.connect(signerAccount).safeMintWhiteList(account, 1000, proofs)
                   ).to.revertedWith(
                       "No eres parte de la lista"
                   );
           });
       });

       describe("Disparando evento", () => {
            it("Se dispara correctamente el evento Burn", async()=>{
                var { cuycollectionnft, owner } = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner.address);

                await cuycollectionnft.safeMint(owner.address, 20);

                await expect(
                    cuycollectionnft.buyBack(20)).to.emit(cuycollectionnft, "Burn").withArgs(owner.address, 20);
                
       });});
                                
});
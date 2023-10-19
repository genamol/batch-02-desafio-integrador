var { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
var { expect } = require("chai");
var { ethers } = require("hardhat");
var { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");
const { construyendoPruebas, getRootFromMT } = require("../utils/merkleTree");
const { id } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 00 horas del 30 de septiembre del 2023 GMT
var startDate = 1696032000;
describe("Testeando Mol Collection NFTs", () => {

var CuyCollectionNFT, cuycollectionnft;

async function deployFixture() {  
    
    var [owner, alice, bob, carl] = await ethers.getSigners();
    
    CuyCollectionNFT = await hre.ethers.getContractFactory("CuyCollectionNft");
    cuycollectionnft = await hre.upgrades.deployProxy(CuyCollectionNFT, {
        kind: "uups",
    });
    var implementationAddress =
    await hre.upgrades.erc1967.getImplementationAddress(
        cuycollectionnft.target
        );
        
        // owner.address.MINTER_ROLE;
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
                await cuycollectionnft.grantRole(MINTER_ROLE, owner);                          
                var aliceMinuscula = alice.address.toLowerCase();
                            
                await expect(
                        cuycollectionnft.connect(alice).safeMint(bob.address, 10)
                        ).to.revertedWith(
                            `AccessControl: account ${alice.address.toLowerCase()} is missing role ${MINTER_ROLE}`);
                             
        });})

        describe("Testeando que el ID sea correcto", () => {
            it("El ID debe estar entre 0 - 999 en safeMint", async () => {

                var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner);
                var incorrectId = 1500;
                await expect(
                    cuycollectionnft.connect(owner).safeMint(bob.address, incorrectId)
                ).to.revertedWith(
                    "Id NFT Invalid"
                );
            });

            it("El ID debe estar entre 1000 - 1999 en safeMintWhiteList", async () => {

                var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner);
                var incorrectId = 2000;
                var account = "0xC840F562D9F69b46b4227003E01525CB99344B72";
                var root = getRootFromMT();
                var proofs = await construyendoPruebas(incorrectId, account);

                await expect(
                    cuycollectionnft.connect(account).safeMintWhiteList(account, incorrectId, proofs)
                ).to.rejectedWith(
                    "Id NFT Invalid"
                );
            });
        }) ;


        describe("Testeando que el address pertenezca a la WhiteList", () => {
            it("La direccion del comprador no esta en la whitelist para safeMintWhiteList", async () => {
                var {cuycollectionnft, owner, alice, bob} = await loadFixture(deployFixture);
                await cuycollectionnft.grantRole(MINTER_ROLE, owner);
                var account = "0xC840F562D9F69b46b4227003E01525CB99344B72";
                var root = getRootFromMT();
                var proofs = await construyendoPruebas(1500, account);
                await expect(
                    cuycollectionnft.connect(account).safeMintWhiteList(account, 1500, proofs)
                    ).to.revertedWith(
                        "No eres parte de la lista"
                    );
            });
        });
                                
});
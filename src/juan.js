import { Contract, ethers } from "ethers";

import usdcTknAbi from "../artifacts/contracts/USDCoin.sol/USDCoin.json";
import bbitesTokenAbi from "../artifacts/contracts/BBitesToken.sol/BBitesToken.json";
import publicSaleAbi from "../artifacts/contracts/PublicSale.sol/PublicSale.json";
import nftTknAbi from  "../artifacts/contracts/CuyCollectionNft.sol/CuyCollectionNft.json"

// SUGERENCIA: vuelve a armar el MerkleTree en frontend
// Utiliza la libreria buffer
import buffer from "buffer/";
import walletAndIds from "../wallets/walletList";
import { MerkleTree } from "merkletreejs";
var Buffer = buffer.Buffer;
var merkleTree;

function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}
function buildMerkleTree() { 
  var elementosHasheados = walletAndIds.map(({ tokenId, account }) => {
    return hashToken(tokenId, account);
  });

  merkleTree = new MerkleTree(elementosHasheados, ethers.keccak256, {
    sortPairs: true,
  });

  root = merkleTree.getHexRoot();

  console.log(root);
}

var provider, signer, account;
var usdcTkContract, bbitesTknContract, pubSContract, nftContract;
var usdcAddress, bbitesTknAdd, pubSContractAdd;

function initSCsGoerli() {
  provider = new ethers.BrowserProvider(window.ethereum);

  usdcAddress = "";
  bbitesTknAdd = "";
  pubSContractAdd = "";

  usdcTkContract = new Contract(usdcAddress, usdcAbi, provider);
  bbitesTknContract = new Contract(bbitesTknAdd, TokenAbi, provider);
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi, provider);
}

function initSCsMumbai() {
  provider = new ethers.BrowserProvider(window.ethereum);

  var nftAddress = "";

  nftContract = new Contract(nftAddress, nftAbi, provider);
}

function setUpListeners() {
  // Connect to Metamask
  var bttn = document.getElementById("connect");
  var walletIdEl = document.getElementById("walletId");
  bttn.addEventListener("click", async function () {
    if (window.ethereum) {
      [account] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Billetera metamask", account);
      walletIdEl.innerHTML = account;
      signer = await provider.getSigner(account);
    }
  });

  // USDC Balance - balanceOf
  var bttn = document.getElementById("usdcUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await usdcTkContract.balanceOf(account);
    var balanceEl = document.getElementById("usdcBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 6);
  });

  // Bbites token Balance - balanceOf
  var bttn = document.getElementById("bbitesTknUpdate");
  bttn.addEventListener("click", async function () {
    var balance = await bbitesTknContract.balanceOf(account);
    var balanceEl = document.getElementById("bbitesTknBalance");
    balanceEl.innerHTML = ethers.formatUnits(balance, 18);
  })

  // APPROVE BBTKN
  // bbitesTknContract.approve
  var bttn = document.getElementById("approveButtonBBTkn");
  bbtn.addEventListener("click", async function () {
    var aproveCant = document.getElementById("approveInput");
    var approveTokens = await bbitesTknContract.connect(signer).approve(pubSContractAdd,aproveCant);
    var muestraAproveError = document.getElementById("approveError");
    muestraAproveError.innerHTML = approveTokens;
    console.log(approveTokens);
  });

  // APPROVE USDC 
  // usdcTkContract.approve
  var bttn = document.getElementById("approveButtonUSDC");
  bbtn.addEventListener("click", async function () {
    var approveUsdc = await usdcTkContract.connect(signer).approve(pubSContractAdd, approveCantusdc);
    var approveCantusdc = document.getElementById("approveInputUSDC");
    var muestraAproveError = document.getElementById("approveErrorUSDC");
    muestraAproveError.innerHTML = approveUsdc;
    console.log(approveUsdc);
  })

  // purchaseWithTokens
  var bttn = document.getElementById("purchaseButton");
  bbtn.addEventListener("click", async function() {
    var purchaseTokens = await pubSContract.connect(signer).purchaseWithTokens(purchaseId);
    var purchaseId = document.getElementById("purchaseInput");
    console.log(purchaseTokens);
  })

  // purchaseWithUSDC
  var bttn = document.getElementById("purchaseButtonUSDC");
  bbtn.addEventListener("click", async function () {
    var purchaseUsdc = await pubSContract.connect(signer).purchaseWithUSDC(purchaseUsdcId, amountUsdc);
    var purchaseUsdcId = document.getElementById("purchaseInputUSDC");
    var amountUsdc = document.getElementById("amountInUSDCInput");
    console.log(purchaseUsdc);
  })

  // purchaseWithEtherAndId
  var bttn = document.getElementById("purchaseButtonEtherId");
  bbtn.addEventListener("click", async function() {
    var purchaseEtherId = await pubSContract.connect(signer).purchaseWithEtherAndId(purchaseInputEtherId);
    var purchaseInputEtherId = document.getElementById("purchaseInputEtherId");
    console.log(purchaseEtherId);
  })

  // send Ether
  var bttn = document.getElementById("sendEtherButton");
  bbtn.addEventListener("click", async function() {
    var send
  })

  // getPriceForId
  var bttn = document.getElementById("getPriceNftByIdBttn");
  bbtn.addEventListener("click", async function() {
    var getPriceNftById = await pubSContract.connect(signer).valueNftTokenAndUsdc(getPriceNftByIdInput);
    var getPriceNftByIdInput = document.getElementById("priceNftIdInput");
    var balanceSpan = document.getElementById("priceNftByIdText");
    balanceSpan.innerHTML = ethers.formatUnits(getPriceNftById)
    console.log(getPriceNftById);
  })

  // getProofs
  var bttn = document.getElementById("getProofsButtonId");
  bttn.addEventListener("click", async () => {
    var id = document.getElementById("inputIdProofId");
    var address = document.getElementById("inputAccountProofId")
    var proofs = merkleTree.getHexProof(hashToken(id, address));
    navigator.clipboard.writeText(JSON.stringify(proofs));
  });

  // safeMintWhiteList
  var bttn = document.getElementById("safeMintWhiteListBttnId");
  // usar ethers.hexlify porque es un array de bytes
  bttn.addEventListener("click", async function(){
    var safeMintWhiteList = await nftContract.connect(signer).safeMintWhiteList(to, tokenId, proofs);
    var to = document.getElementById("whiteListToInputId");
    var tokenId = document.getElementById("whiteListToInputTokenId");
    var proofs = document.getElementById("whiteListToInputProofsId").value;
    proofs = JSON.parse(proofs).map(ethers.hexlify);

    console.log(safeMintWhiteList);
  })


  // buyBack
  var bttn = document.getElementById("buyBackBttn");
  bbtn.addEventListener("click", async function(){
    var buyBack = await nftContract.connect(signer).buyBack(buyBackInputId);
    console.log(buyBack);
  })
}

function setUpEventsContracts() {
  var pubSList = document.getElementById("pubSList");
  // pubSContract - "PurchaseNftWithId"
  pubSContract.on("PurchaseNftWithId", (from, id));
  console.log("From", from);
  console.log("Id", id);
  

  var bbitesListEl = document.getElementById("bbitesTList");
  // bbitesCListener - "Transfer"

  var nftList = document.getElementById("nftList");
  // nftCListener - "Transfer"

  var burnList = document.getElementById("burnList");
  // nftCListener - "Burn"
  nftContract.on("Burn",(from, id));
  console.log("From", from);
  console.log("Id", id);
}

async function setUp() {
  window.ethereum.on("chainChanged", (chainId) => {
    window.location.reload();
  });

  initSCsGoerli();

  // initSCsMumbai

  // setUpListeners

  // setUpEventsContracts

  // buildMerkleTree
}

setUp()
  .then()
  .catch((e) => console.log(e));
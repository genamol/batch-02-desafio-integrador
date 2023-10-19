const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("hardhat");
const walletAndIds = require("../wallets/walletList");

var merkleTree, root;
function hashToken(tokenId, account) {
  return Buffer.from(
    ethers
      .solidityPackedKeccak256(["uint256", "address"], [tokenId, account])
      .slice(2),
    "hex"
  );
}

function getRootFromMT() {
  var elementosHasheados = walletAndIds.map(({ id, address }) => {
    return hashToken(id, address);
  });
  merkleTree = new MerkleTree(elementosHasheados, keccak256, {
    sortPairs: true,
  });

  root = merkleTree.getHexRoot();

  console.log(`La nueva raiz es: ${root}`);
  return root;
}

var hasheandoElemento, pruebas;
function construyendoPruebas(tokenId, account) {

  hasheandoElemento = hashToken(tokenId, account);
  pruebas = merkleTree.getHexProof(hasheandoElemento);
  console.log(pruebas);

  // verificacion off-chain
  var pertenece = merkleTree.verify(pruebas, hasheandoElemento, root);
  console.log(pertenece);
  return pruebas;
}

module.exports = { getRootFromMT, construyendoPruebas };

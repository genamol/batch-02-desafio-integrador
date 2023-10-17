// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CuyCollectionNft is 
    Initializable, 
    ERC721Upgradeable, 
    ERC721BurnableUpgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable {
    
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 public root;

    event Burn(address account, uint256 id);

    mapping (uint256 => address) owners;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __ERC721_init("Mol NFTs", "MOL");
        __ERC721Burnable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

     function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmTWvm55znTX6NmgopdUpJX8CJsNzhGJY4bJVmMvoJP5hA/";
    }

    

    function safeMint(
        address to,
        uint256 tokenId
    ) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
    }

    function safeMintWhiteList(
        address to,
        uint256 tokenId,
        bytes32[] calldata proofs
    ) public {
        require(tokenId >= 1000 && tokenId <= 1999, "Id NFT Invalid");
        
        // Antes de acuñar vamos a validar pertenecia
        // Vamos a validar si to y tokenId son parte de la lista
        // verify()
        require(
            verify(_hashearInfo(to, tokenId), proofs),
            "No eres parte de la lista"
        );
        _safeMint(to, tokenId);
    }

    function buyBack(uint256 id) public {
        transferFrom(msg.sender, address(0), id);
        emit Burn(msg.sender, id);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

 // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }





    /// MERKLE TREE

    function _hashearInfo(
        address to,
        uint256 tokenId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, to));
    }

    function verify(
        bytes32 leaf,
        bytes32[] memory proofs
    ) public view returns (bool) {
        return MerkleProof.verify(proofs, root, leaf);
    }

    function verifyMerkleProof(
        bytes32 leaf,
        bytes32[] memory proofs
    ) public view returns (bool) {
        bytes32 computedHash = leaf;
        // proofs es un array de pruebas
        // evaluar su complejidad lexicografica
        // se calcula el hash con el elemento menos complejo a la izquierda
        // se calcula el hash con el elemento más complejo a la derecha

        for (uint256 i; i < proofs.length; i++) {
            bytes32 proof = proofs[i];

            if (computedHash < proof) {
                // computedHash va a la izquierda y proof a la derecha
                // hash(computed, proof)
                computedHash = keccak256(abi.encodePacked(computedHash, proof));
            } else {
                computedHash = keccak256(abi.encodePacked(proof, computedHash));
            }
        }

        return computedHash == root;
    }

    function updateRoot(bytes32 _root) public {
        root = _root;
    }

}

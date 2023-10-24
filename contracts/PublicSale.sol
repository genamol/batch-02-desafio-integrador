//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {IUniSwapV2Router02} from "./Interfaces.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBBTKN {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function _beforeTokenTransfer(address from, address to, uint256 amount) external;
}

interface IUSDC {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PublicSale is 
    Initializable, 
    PausableUpgradeable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable
    {
    
   function generateRandomNumber() public view returns (uint256) {
        // Generar un número aleatorio en el rango de 0 a 299
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp))) % 300;

        // Sumar 700 al número aleatorio para obtener un valor en el rango de 700 a 999
        return randomNumber + 700;
    }
    

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    event PurchaseNftWithId(address account, uint256 id);

    mapping (uint256 => bool) minted;

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    address addressBBTKN;
    IBBTKN bbtkn;
    address addressUSDC;
    IUSDC usdc;
    address routerAddress;
    IUniSwapV2Router02 router;

    function initialize() initializer public {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

    addressBBTKN = 0x65b539D24ebFDcb9A6a127e335f184C5FFb6d1f1;
    bbtkn = IBBTKN(addressBBTKN);
    addressUSDC = 0xBDf3bB8123c1d4b5A22C2f278731a6691C3585A8;
    usdc = IUSDC(addressUSDC);
    routerAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    router = IUniSwapV2Router02(routerAddress);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function valueNftTokenAndUsdc (uint256 _id) internal view returns (uint256) {
        uint256 valueNft;
        require (_id >= 0 && _id <= 699, "Invalid NFT ID");
        if (_id >= 0 && _id <= 199) {
            valueNft = 1000 * 10 ** 18;
        }else if (_id >= 200 && _id <= 499) {
            valueNft = _id * (20 * 10 ** 18);
        }else if (_id >= 500 && _id <= 699) {
            valueNft = (10000 *10 ** 18 ) + (((block.timestamp - startDate)/86400) * (2000 * 10 ** 18 ));
            if (valueNft > MAX_PRICE_NFT ) {
                valueNft = MAX_PRICE_NFT;
            }
        }
        return valueNft;
    }

    function purchaseWithTokens(uint256 _id) public {
        require(0<= _id && _id <= 699, "Invalid NFT ID");
        require(minted[_id] == false, "Este Id NFT ya fue minteado");
        uint256 price = valueNftTokenAndUsdc(_id);
        bool accept = bbtkn.transferFrom(msg.sender, address(this), price);
        emit PurchaseNftWithId(msg.sender, _id);
        minted[_id] = true;
    }

    function purchaseWithUSDC(uint256 _id, uint256 _amountIn) external {
        require(0<= _id || _id <= 699, "Invalid NFT ID");
        require(minted[_id] == false, "Este Id NFT ya fue minteado");
        uint256 price = valueNftTokenAndUsdc(_id);
        // transfiere _amountIn de USDC a este contrato
        usdc.transferFrom(msg.sender, address(this), _amountIn);
        
        // llama a swapTokensForExactTokens: valor de retorno de este metodo es cuanto gastaste del token input
        usdc.approve(routerAddress, _amountIn);
        address[] memory path = new address[](2);
        path[0] = addressUSDC;
        path[1] = addressBBTKN;
        uint256[] memory amounts = router.swapTokensForExactTokens(price, _amountIn, path, msg.sender, 120);
        
        // transfiere el excedente de USDC a msg.sender
        if (_amountIn > amounts[0]) {
            usdc.transfer(msg.sender, _amountIn - amounts[0]);
        }
    
        emit PurchaseNftWithId(msg.sender, _id);
        minted[_id] = true;
    }

    function purchaseWithEtherAndId(uint256 _id) public payable {
        require(700<= _id || _id <= 999, "Invalid NFT ID");
        require(minted[_id] == false, "Este Id NFT ya fue minteado");
        require(msg.value == 0.01 ether, "El NFT tiene un valor de 0.01 ETH");

        emit PurchaseNftWithId(msg.sender, _id);
        minted[_id] = true;
    }

    function depositEthForARandomNft() public payable {
        require(msg.value == 0.01 ether, "El NFT tiene un valor de 0.01 ETH");

        uint256 _id = generateRandomNumber();
        require(minted[_id] == false, "Este Id NFT ya fue minteado");
        emit PurchaseNftWithId(msg.sender, _id);
        minted[_id] = true;
    }

    receive() external payable {
        depositEthForARandomNft();
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}

}
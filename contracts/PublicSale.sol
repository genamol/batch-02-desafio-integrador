//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import {IUniSwapV2Router02} from "./Interfaces.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PublicSale is 
    Initializable, 
    PausableUpgradeable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable
    {
    
    function montoAleatorio() public view returns (uint256) {
    uint256 monto =  (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 1000);
    require(700 <= monto && monto <=999);
    return monto;
    }
    
    address addressBBTKN;
    // IBBTKN bbtkn = IBBTKN(addressBBTKN);
    address addressUSDC;
    // IUSDC usdc = IUSDC(addressUSDC);
    address routerAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniSwapV2Router02 router = IUniSwapV2Router02(routerAddress);

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EXECUTER_ROLE = keccak256("EXECUTER_ROLE");

    // 00 horas del 30 de septiembre del 2023 GMT
    uint256 constant startDate = 1696032000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 90_000 * 10 ** 18;

    event PurchaseNftWithId(address account, uint256 id);

    ///@custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function valueNftTokenAndUsdc (uint256 _id) internal view returns (uint256) {
        uint256 valueNft;
        require (_id >= 0 && _id <= 699, "Id NFT invalid.");
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
        require(0<= _id || _id <= 699, "NFT ID Invalid");
        uint256 price = valueNftTokenAndUsdc(_id);
        //bbtkn.transferFrom(msg.sender, address(this), price);
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithUSDC(uint256 _id, uint256 _amountIn) external {
        require(0<= _id || _id <= 699, "NFT ID Invalid");
        // transfiere _amountIn de USDC a este contrato
        //usdc.transferFrom(msg.sender, address(this), _amountIn);
        uint256 price = valueNftTokenAndUsdc(_id);
        
        // llama a swapTokensForExactTokens: valor de retorno de este metodo es cuanto gastaste del token input
        //usdc.approve(routerAddress, _amountIn);
        //uint256[] amounts = router.swapTokensForExactTokens(price, _amountIn, [addressUSDC, addressBBTKN], msg.sender, 120);
        
        // transfiere el excedente de USDC a msg.sender
        //if (_amountIn > amounts[0]) {
        //    usdc.transfer(msg.sender, _amountIn - amounts[0]);
        //}
    
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function purchaseWithEtherAndId(uint256 _id) public payable {
        require(700<= _id || _id <= 999, "NFT ID Invalid");
        uint256 price = 0.01 ether;
        transfer(address(this), price);
        emit PurchaseNftWithId(msg.sender, _id);
    }

    function depositEthForARandomNft() public payable {
        uint256 price = 0.01 ether;
        transfer(address(this), price);
        uint256 _id = montoAleatorio();
        emit PurchaseNftWithId(msg.sender, _id);
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
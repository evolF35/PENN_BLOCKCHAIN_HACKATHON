// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Claim is ERC20, Ownable {
    constructor(string memory name, string memory acronym) ERC20(name,acronym) {
    }
    function mint(uint256 amount) external onlyOwner {
        _mint(msg.sender,amount);
    }
    function turnToDust() external onlyOwner {
        selfdestruct(payable(0x10328D18901bE2278f8105D9ED8a2DbdE08e709f));
    }
}

contract Pool {
    using SafeERC20 for Claim;

    uint256 startDate;
    uint256 settlementDate;

    int256 price;
    address oracleAddress;

    uint256 decayFactor;
    // address decayAddress;
    // address capitalfactorAddress;
    // uint256 capitalFactor;
    uint256 maxRatio;
    uint256 maxRatioDate;

    bool condition;
    bool withdraw;

    uint256 turnToDustDate;

    uint256 numDepPos = 0;
    uint256 numDepNeg = 0;
    mapping (address => uint) PosAmtDeposited;
    mapping (address => uint) NegAmtDeposited;

    Claim public positiveSide;
    Claim public negativeSide;

    event ClaimsCreated(address POS, address NEG);
    event DepNumNegChanged(uint256 num);
    event DepNumPosChanged(uint256 num);
    event ConditionChanged(bool condition);
    event WithdrawChanged(bool withdraw);
    event pastSettlementDateChanged(bool pastSettlementDate);
    event contractGone(bool gone);

    AggregatorV3Interface public oracle;

    constructor(
        address _oracle, 
        int256 _price, 
        uint256 _settlementDate,
        uint256 _decay, 
        uint256 _maxRatio, 
        uint256 _maxRatioDate,
        string memory name,
        string memory acronym,
        uint256 _turnToDustDate
        ) 
        {
        startDate = block.timestamp;
        settlementDate = _settlementDate;

        price = _price;
        oracleAddress = _oracle;
        decayFactor = _decay;
        maxRatio = _maxRatio;
        maxRatioDate = _maxRatioDate;
        turnToDustDate = _turnToDustDate;

        string memory over = "Over";
        string memory Over = string(bytes.concat(bytes(name), "-", bytes(over)));

        string memory under = "Under";
        string memory Under = string(bytes.concat(bytes(name), "-", bytes(under)));

        string memory Pacr = "POS";
        string memory PAC = string(bytes.concat(bytes(acronym), "-", bytes(Pacr)));

        string memory Nacr = "NEG";
        string memory NAC = string(bytes.concat(bytes(acronym), "-", bytes(Nacr)));

        positiveSide = new Claim(Over,PAC);
        negativeSide = new Claim(Under,NAC);

        emit ClaimsCreated(address(positiveSide), address(negativeSide));

        condition = false;

        oracle = AggregatorV3Interface(oracleAddress);
    }

    function depositToPOS() public payable {
        require(block.timestamp < settlementDate);
        require(msg.value > 0.001 ether, "Too little ETH deposited");
        
        uint256 temp = (block.timestamp - startDate);
        uint256 discount = temp * decayFactor;
        uint256 amt = (msg.value)*(1e18 - discount);
        
        positiveSide.mint(amt);
        positiveSide.safeTransfer(msg.sender,amt);

        numDepPos = numDepPos + msg.value;
        PosAmtDeposited[msg.sender] = PosAmtDeposited[msg.sender] + msg.value;

        emit DepNumPosChanged(numDepPos);
    }

    function depositToNEG() public payable {
        require(block.timestamp < settlementDate);
        require(msg.value > 0.001 ether, "Too little ETH deposited");
        
        negativeSide.mint(msg.value);
        negativeSide.safeTransfer(msg.sender,msg.value);

        uint256 temp = (block.timestamp - startDate);
        uint256 discount = temp * decayFactor;
        uint256 amt = (msg.value)*(1e18 - discount);
        
        negativeSide.mint(amt);
        negativeSide.safeTransfer(msg.sender,amt);

        numDepNeg = numDepNeg + msg.value;
        NegAmtDeposited[msg.sender] = NegAmtDeposited[msg.sender] + msg.value;

        emit DepNumNegChanged(numDepNeg);
    }

    function settle() public {
        require(block.timestamp > settlementDate, "Current time is before settlement date");

        (,int256 resultPrice,,,) = oracle.latestRoundData();

        if(resultPrice >= price){
            condition = true;
            emit ConditionChanged(condition);
        }
        emit pastSettlementDateChanged(true);
    }

    function redeemWithPOS() public { 
        require(block.timestamp > settlementDate, "Current time is before settlement date");
        require(condition == true,"The POS side did not win");
        require(positiveSide.balanceOf(msg.sender) > 0, "You have no tokens");

        uint256 saved = ((positiveSide.balanceOf(msg.sender)*(address(this).balance))/positiveSide.totalSupply());
        
        positiveSide.safeTransferFrom(msg.sender,address(this),positiveSide.balanceOf(msg.sender));

        (payable(msg.sender)).transfer(saved);
    }

    function redeemWithNEG() public {
        require(block.timestamp > settlementDate, "Current time is before settlement date");
        require(condition == false,"The NEG side did not win");
        require(negativeSide.balanceOf(msg.sender) > 0, "You have no tokens");

        uint256 saved = ((negativeSide.balanceOf(msg.sender)*(address(this).balance))/negativeSide.totalSupply());
        
        negativeSide.safeTransferFrom(msg.sender,address(this),negativeSide.balanceOf(msg.sender));

        (payable(msg.sender)).transfer(saved);
    }

    function turnWithdrawOn() public {
        require(block.timestamp < maxRatioDate, "The Withdrawal Date has passed");
        require(PosAmtDeposited[msg.sender] > 0 ||  NegAmtDeposited[msg.sender] > 0, "You have not deposited any funds");
        require((numDepPos/numDepNeg) > maxRatio, "The minimum ratio has not been met");
        if((numDepPos/numDepNeg) > maxRatio){
            withdraw = true;
            emit WithdrawChanged(withdraw);
        }
    }

    function withdrawWithPOS() public {
        require(withdraw == true,"Withdrawals have not been turned on");
        require(block.timestamp < maxRatioDate, "The Withdrawal Date has passed");
        require(positiveSide.balanceOf(msg.sender) > 0, "You have no tokens");

        if((numDepPos - PosAmtDeposited[msg.sender])/(numDepNeg) > maxRatio){
            require(true == false, "You can't withdraw because it would increase the ratio above the max ratio");
        }

        positiveSide.safeTransferFrom(msg.sender,address(this),positiveSide.balanceOf(msg.sender));

        uint256 placeholder = PosAmtDeposited[msg.sender];
        PosAmtDeposited[msg.sender] = 0;
        numDepPos = numDepPos - placeholder;
        emit DepNumPosChanged(numDepPos);

        (payable(msg.sender)).transfer(placeholder);
    }

    function withdrawWithNEG() public {
        require(withdraw == true,"Withdrawals have not been turned on");
        require(block.timestamp < maxRatioDate, "The Withdrawal Date has passed");
        require(negativeSide.balanceOf(msg.sender) > 0, "You have no tokens");

        if((numDepPos)/(numDepNeg - NegAmtDeposited[msg.sender]) > maxRatio){
            require(true == false, "You can't withdraw because it would increase the ratio above the max ratio");
        }

        negativeSide.safeTransferFrom(msg.sender,address(this),negativeSide.balanceOf(msg.sender));

        uint256 placeholder = NegAmtDeposited[msg.sender];
        NegAmtDeposited[msg.sender] = 0;
        numDepNeg = numDepNeg - placeholder;
        emit DepNumNegChanged(numDepNeg);

        (payable(msg.sender)).transfer(placeholder);
    }

    function turnToDust() public {
        require(block.timestamp > turnToDustDate, "Current time is before Destruction date");

        positiveSide.turnToDust();
        negativeSide.turnToDust();

        emit contractGone(true);
        selfdestruct(payable(0x10328D18901bE2278f8105D9ED8a2DbdE08e709f));
    }
}

contract deploy {
    event PoolCreated(
        address _oracle, 
        int256 _price, 
        uint256 _settlementDate,
        uint256 decay,
        uint256 maxRatio,
        uint256 maxRatioDate,
        string name,
        string acronym,
        address poolAddress, 
        uint256 turnToDustDate);

    function createPool(
        address oracle, 
        int256 price, 
        uint256 settlementDate,
        uint256 decay,
        uint256 maxRatio,
        uint256 maxRatioDate,
        string memory name,
        string memory acronym, 
        uint256 turnToDustDate) 
    
            public returns (address newPool)
            {
                newPool = address(new Pool(oracle,price,settlementDate,decay,maxRatio,maxRatioDate,name,acronym,turnToDustDate));
                emit PoolCreated(oracle,price,settlementDate,decay,maxRatio,maxRatioDate,name,acronym,newPool, turnToDustDate);
                return(newPool);
            }
}


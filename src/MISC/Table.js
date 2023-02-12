
import * as React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import deployABI from '../ABIs/Deploy.json'
import claimABI from '../ABIs/Claim.json'
import poolABI from '../ABIs/Pool.json'
import { ethers } from "ethers";


import GoerliAddressData from './GoerliChainlinkOracles.js'


let defaultAccount;


const depToPOS = async (event,Addr1) => {
    event.preventDefault();
    let tempProvider2 = new ethers.providers.Web3Provider(window.ethereum);
    let tempSigner2 = tempProvider2.getSigner();
    let tempContract3 = new ethers.Contract(Addr1, poolABI, tempSigner2);
    let stringNum = (event.target[0].value).toString();
    let deus = ethers.utils.parseEther(stringNum);

    await tempContract3.depositToPOS({value:deus});
}

	const depToNEG = async (event,Addr1) => {
		event.preventDefault();
		let tempProvider2 = new ethers.providers.Web3Provider(window.ethereum);
		let tempSigner2 = tempProvider2.getSigner();
		let tempContract3 = new ethers.Contract(Addr1, poolABI, tempSigner2);
		let stringNum = (event.target[0].value).toString();
		let deus = ethers.utils.parseEther(stringNum);

		await tempContract3.depositToNEG({value:deus});
	}

	const approveNEG = async (event,Addr1,Addr2) => {
		
		event.preventDefault();
		
		let tempProvider2 = new ethers.providers.Web3Provider(window.ethereum);
		let tempSigner2 = tempProvider2.getSigner();

		let tempContract44 = new ethers.Contract(Addr1, claimABI, tempProvider2);
		let tempContract3 = new ethers.Contract(Addr1, claimABI, tempSigner2);

		let balance = await tempContract44.balanceOf(defaultAccount);

		await tempContract3.approve(Addr2,balance);
	}

	const approvePOS = async (event,Addr1,Addr2) => {
		
		event.preventDefault();
		
		let tempProvider2 = new ethers.providers.Web3Provider(window.ethereum);
		let tempSigner2 = tempProvider2.getSigner();

		let tempContract44 = new ethers.Contract(Addr1, claimABI, tempProvider2);
		let tempContract3 = new ethers.Contract(Addr1, claimABI, tempSigner2);


		let balance = await tempContract44.balanceOf(defaultAccount);

		await tempContract3.approve(Addr2,balance);
	}
	const callContractFunction = async (event, contractAddress, functionName) => {
		event.preventDefault();
		
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		let tempSigner = tempProvider.getSigner();
		
		let tempContract = new ethers.Contract(contractAddress, poolABI, tempSigner);
	  
		switch (functionName) {
		  case 'redeemwithPOS':
			await tempContract.redeemWithPOS();
			break;
		  case 'redeemwithNEG':
			await tempContract.redeemWithNEG();
			break;
		  case 'withdrawNEG':
			await tempContract.withdrawWithNEG();
			break;
		  case 'withdrawPOS':
			await tempContract.withdrawWithPOS();
			break;
		  case 'settle':
			await tempContract.settle();
			break;
		  case 'makeWithdrawable':
			await tempContract.turnWithdrawOn();
			break;
		  case 'deZtruction':
			await tempContract.turnToDust();
			break;
		  default:
			throw new Error(`Invalid function name: ${functionName}`);
		}
	  }


function createData(modifiedTB) {

  let data = modifiedTB;
  if (!data.zTOTBAL) return null;

  return {
    totalBalance: data.zTOTBAL,
    POSBalance: data.zPOSBal,
    NEGBalance: data.zNEGBal,
    SettlementPrice: data.args[1].toString(),
    SettlementDate: data.args[2].toString(),
    DecayRate: data.args[3].toString(),
    MaxRatio: data.args[4].toString(),
    MaxRatioDate: data.args[5].toString(),
    PastSettlementDate: data.zPSDATE.toString(),
    Condition: data.zCONDITION,
    DiscountRate: data.zDVALUE,
    Withdraw: data.zWITHDRAW,
    details: [
      {
        ContractAddress: data.args[8],
        OracleAddress: data.args[0],
        Name: data.args[6],
        Acronym: data.args[7],
        DestructionDate: data.args[9].toString(),
        POSAddress: data.zPOSADD,
        NEGAddress: data.zNEGADD,
      },
    ],
  };
}


function Row(props) {
  let row = props;
  const [open, setOpen] = React.useState(false);

  const [innerOpen, setInnerOpen] = useState(false);

  const [showFullStringOracle, setShowFullStringOracle] = useState(-1);
  const [showFullStringPOS, setShowFullStringPOS] = useState(-1);
  const [showFullStringNEG, setShowFullStringNEG] = useState(-1);
  const [showFullStringContract, setShowFullStringContract] = useState(-1);

  const handleOracleClick = (index) => {
    setShowFullStringOracle(index === showFullStringOracle ? -1 : index);
  }
  
  const handlePOSClick = (index) => {
    setShowFullStringPOS(index === showFullStringPOS ? -1 : index);
  }
  
  const handleNEGClick = (index) => {
    setShowFullStringNEG(index === showFullStringNEG ? -1 : index);
  }

  const handleContractClick = (index) => {
    setShowFullStringContract(index === showFullStringContract ? -1 : index);
  }

  if (!row) return null;

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell align='center'>{GoerliAddressData.find(item => item.address === row.row.details[0].OracleAddress)?.name || '?'}</TableCell>

        <TableCell align="center">{row.row.totalBalance}</TableCell>
        <TableCell align="center">{row.row.POSBalance}</TableCell>
        <TableCell align="center">{row.row.NEGBalance}</TableCell>
        <TableCell align="center">{(parseFloat(row.row.SettlementPrice) / 100000000)}</TableCell>
        <TableCell align="center">{new Date(row.row.SettlementDate * 1000).toLocaleString("en-US", {timeZone: "UTC",weekday: "long",year: "numeric",month: "long",day: "numeric",hour: "numeric",minute: "numeric",second: "numeric"}) + " GMT"}</TableCell>
        <TableCell align="center">{row.row.DecayRate}</TableCell>
        <TableCell align="center">{row.row.MaxRatio}</TableCell>
        <TableCell align="center">{new Date(row.row.MaxRatioDate * 1000).toLocaleString("en-US", {timeZone: "UTC",weekday: "long",year: "numeric",month: "long",day: "numeric",hour: "numeric",minute: "numeric",second: "numeric"}) + " GMT"}</TableCell>
        <TableCell align="center">{row.row.PastSettlementDate}</TableCell>
        <TableCell align="center">{row.row.Condition}</TableCell>
        <TableCell align="center">{row.row.DiscountRate}</TableCell>
        <TableCell align="center">{row.row.Withdraw}</TableCell>

      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={20}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>

              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Contract Address</TableCell>
                    <TableCell>Oracle Address</TableCell>
                    <TableCell >Name</TableCell>
                    <TableCell > Acronym </TableCell>
                    <TableCell > DestructionDate </TableCell>
                    <TableCell > POS Address </TableCell>
                    <TableCell > NEG Address </TableCell>

                    <TableCell > Deposit To POS </TableCell>
                    <TableCell > Deposit To NEG </TableCell>


                  </TableRow>
                </TableHead>
                <TableBody>

                <TableRow >

                      <TableCell className='addressClick' component="th" scope="row" onClick={() => handleContractClick(0)}>{showFullStringContract === 0 ? row.row.details[0].ContractAddress : row.row.details[0].ContractAddress.substring(0, 6)}</TableCell>                      
                      <TableCell className='addressClick' align="center" onClick={() => handleOracleClick(0)}>{showFullStringOracle === 0 ? row.row.details[0].OracleAddress : row.row.details[0].OracleAddress.substring(0, 6)}</TableCell>                      
                      <TableCell align="center">{row.row.details[0].Name}</TableCell>
                      <TableCell align="center">{row.row.details[0].Acronym}</TableCell>
                      <TableCell align="center" >{new Date(row.row.details[0].DestructionDate * 1000).toLocaleString("en-US", {timeZone: "UTC",weekday: "long",year: "numeric",month: "long",day: "numeric",hour: "numeric",minute: "numeric",second: "numeric"}) + " GMT"}</TableCell>
                      <TableCell className='addressClick' align="center" onClick={() => handlePOSClick(0)}>{showFullStringPOS === 0 ? row.row.details[0].POSAddress : row.row.details[0].POSAddress.substring(0, 6)}</TableCell>
                      <TableCell className='addressClick' align="center" onClick={() => handleNEGClick(0)}>{showFullStringNEG === 0 ? row.row.details[0].NEGAddress : row.row.details[0].NEGAddress.substring(0, 6)}</TableCell>
                      <TableCell> <form  onSubmit={(e) => depToPOS(e, row.row.details[0].ContractAddress.toString())}> <input className='depositTable' type="text" ></input> <button type="submit" >POS</button> </form> </TableCell>
                      <TableCell> <form  onSubmit={(e) => depToNEG(e, row.row.details[0].ContractAddress.toString())}> <input className='depositTable' type="text" ></input> <button type="submit" >NEG</button> </form> </TableCell>

                  </TableRow>

                  <TableRow >
    
                  <TableCell> <form className='approvePOS' onSubmit={(e) => approvePOS(e, row.row.details[0].POSAddress.toString() ,row.row.details[0].ContractAddress.toString())}> <button type="submit" >Approve POS </button> </form> </TableCell>
                      <TableCell> <form className='approveNEG' onSubmit={(e) => approveNEG(e, row.row.details[0].NEGAddress.toString() ,row.row.details[0].ContractAddress.toString())}> <button type="submit" >Approve NEG </button> </form> </TableCell>
                      <TableCell> <form className='redeemPOS' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'redeemwithPOS')}> <button type="submit" >Redeem POS </button> </form> </TableCell>
                      <TableCell> <form className='redeemNEG' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'redeemwithNEG')}> <button type="submit" >Redeem NEG </button> </form> </TableCell>
                      <TableCell> <form className='withdrawPOS' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'withdrawPOS')}> <button type="submit" >Withdraw POS </button> </form> </TableCell>
                      <TableCell> <form className='withdrawNEG' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'withdrawNEG')}> <button type="submit" >Withdraw NEG </button> </form> </TableCell>
                      <TableCell> <form className='settle' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'settle')}> <button type="submit" > Settle </button> </form> </TableCell>
                      <TableCell> <form className='turnwithdrawon' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'makeWithdrawable')}> <button type="submit" > TurnWithdrawOn </button> </form> </TableCell>
                      <TableCell> <form className='SelfDestruct' onSubmit={(e) => callContractFunction(e, row.row.details[0].ContractAddress.toString(),'deZtruction')}> <button type="submit" > DESTRUCTION </button> </form></TableCell>

                    </TableRow>

                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
      totalBalance: PropTypes.string,
      POSBalance: PropTypes.string,
      NEGBalance: PropTypes.string,
      SettlementPrice: PropTypes.string,
      SettlementDate: PropTypes.string,
      DecayRate: PropTypes.string,
      MaxRatio: PropTypes.string,
      MaxRatioDate: PropTypes.string,
      PastSettlementDate: PropTypes.string,
      Condition: PropTypes.string,
      DiscountRate: PropTypes.string,
      Withdraw: PropTypes.string,
      details: PropTypes.arrayOf(PropTypes.shape({
          ContractAddress: PropTypes.string,
          OracleAddress: PropTypes.string,
          Name: PropTypes.string,
          Acronym: PropTypes.string,
          DestructionDate: PropTypes.string,
          POSAddress: PropTypes.string,
          NEGAddress: PropTypes.string,
      }))
  }).isRequired,
};

export default function CollapsibleTable(props) {

  let florins = props.rows;
  defaultAccount = props.defaultAccount;


  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="center"> Oracle Type </TableCell>
            <TableCell align="center">Total Balance</TableCell>
            <TableCell align="center"> POS Balance </TableCell>
            <TableCell align="center"> NEG Balance </TableCell>
            <TableCell align="center"> Settlement Price $ </TableCell>
            <TableCell align="center"> Settlement Date </TableCell>
            <TableCell align="center"> Decay Rate </TableCell>
            <TableCell align="center"> Max Ratio </TableCell>
            <TableCell align="center"> Max Ratio Date </TableCell>
            <TableCell align="center"> Past Settlement Date </TableCell>
            <TableCell align="center"> Condition </TableCell>
            <TableCell align="center"> Discount Rate </TableCell>
            <TableCell align="center"> Withdraw </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
{florins.map((row) => {
   const data = createData(row);
   return data ? <Row key={data.contractAddress} row={data} /> : null;
})}

</TableBody>
      </Table>
    </TableContainer>
  );
}





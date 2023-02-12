

import React, {useState} from 'react'
import deployABI from '../ABIs/Deploy.json'
import claimABI from '../ABIs/Claim.json'
import poolABI from '../ABIs/Pool.json'

import CollapsibleTable from '../MISC/Table'



const PoolJS = () => {
	let contractAddress = '0x830E91da2d1a09756e4B8230D07915Ff9e6dCafe';

	const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [connButtonText, setConnButtonText] = useState('Connect Wallet');
	const [currentContractVal, setCurrentContractVal] = useState(null);
	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);

	const [tb, setTb] = useState(null);
	const [tb2,setTb2] = useState(null);

	const connectWalletHandler = () => {
		if (window.ethereum && window.ethereum.isMetaMask) {
			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
				accountChangedHandler(result[0]);
				setConnButtonText('Wallet Connected');
			})
			.catch(error => {
				setErrorMessage(error.message);
			});

		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();
	}
	const chainChangedHandler = () => {
		window.location.reload();
	}
	window.ethereum.on('accountsChanged', accountChangedHandler);
	window.ethereum.on('chainChanged', chainChangedHandler);
	const updateEthers = () => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);

		let tempContract = new ethers.Contract(contractAddress, deployABI, tempSigner);
		setContract(tempContract);	
        console.log("contract set");
	}

	const [modifiedTb, setModifiedTb] = useState([]);
	
    const getEvents = async () => {

		const tb = await contract.queryFilter("*");
		setTb(tb);


		let z = poolInfo(tb[0].args[8]);


		const modifiedTb = await tb.map(async (element, index) => {
			const zPOSBal = await getPoolInfo(tb[index].args[8]);

			let zPOSADD = zPOSBal[0].args[0];
			let zNEGADD = zPOSBal[0].args[1];

			let depPOS = 0;

			try{
				depPOS = await callViewPoolFunction(tb[index].args[8],'getDepNumPOS');
			}
			catch(error){
				return {...element}
			}
			let depNEG = await callViewPoolFunction(tb[index].args[8],'getDepNumNEG');
			let totBal = await callViewPoolFunction(tb[index].args[8],'getBalance');
			let condition = await callViewPoolFunction(tb[index].args[8],'getCondition');
			let withdrawON = await callViewPoolFunction(tb[index].args[8],'withdrawOn');
			let dValue = await callViewPoolFunction(tb[index].args[8],'getDiscountedValue');
			let pastSettleDate = await callViewPoolFunction(tb[index].args[8],'pastSettlementDate');

			return {
			  ...element, // Spread the existing properties of element
			  zPOSBal: (ethers.utils.formatEther(depPOS)).toString(),
			  zNEGBal: (ethers.utils.formatEther(depNEG)).toString(),
			  zPOSADD: zPOSADD,
			  zNEGADD: zNEGADD,
			  zTOTBAL: (ethers.utils.formatEther(totBal)).toString(),
			  zCONDITION: condition.toString(),
			  zWITHDRAW: withdrawON.toString(),
			  zDVALUE: dValue.toString(),
			  zPSDATE: pastSettleDate.toString(),
			}
		  });

		  setModifiedTb(modifiedTb);


		let done = await Promise.all(modifiedTb);
		setTb(done);


		const hiddenRows = document.querySelectorAll('.Hidden');
		for (let row of hiddenRows) {
  			row.style.display = 'none';
		}

		const expandButtons = document.querySelectorAll('.expand-button');

for (let button of expandButtons) {
  button.addEventListener('click', function() {
    const hiddenTable = this.parentElement.parentElement.querySelectorAll('.Hidden');
	if(hiddenTable[0].style.display === 'none') {
		hiddenTable[0].style.display = '';
	}
	else {
		hiddenTable[0].style.display = 'none';
	}

  });
}

}
	  const getPoolInfo = async (pool) => {
		try {
		  const result = await poolInfo(pool);
		  return result;
		} catch (error) {
		  console.error(error);
		}
	  };

	  const poolInfo = async (pool) => {

		let tempProvider2 = new ethers.providers.Web3Provider(window.ethereum);
		let tempSigner2 = tempProvider2.getSigner();

		let tempContract3 = new ethers.Contract(pool, poolABI, tempProvider2);
		const bfor4 = await tempContract3.queryFilter("*");
		return(bfor4);
	}

	const callViewPoolFunction = async (pool, functionName) => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		let tempContract = new ethers.Contract(pool, poolABI, tempProvider);
		let result;
		switch (functionName) {
		  case 'getDepNumPOS':
			result = await tempContract.getDepNumPOS();
			break;
		  case 'getDepNumNEG':
			result = await tempContract.getDepNumNEG();
			break;
		  case 'getBalance':
			result = await tempProvider.getBalance(pool);
			break;
		  case 'getCondition':
			result = await tempContract.getCondition();
			break;
		  case 'withdrawOn':
			result = await tempContract.withdrawOn();
			break;
		  case 'getDiscountedValue':
			result = await tempContract.getDiscountedValue();
			break;
		  case 'pastSettlementDate':
			result = await tempContract.pastSettlementDate();
			break;
		  default:
			throw new Error(`Invalid function name: ${functionName}`);
		}
		return result;
	  }
		return (
		<div>
		<h4> Current Pools </h4>
			<button onClick={connectWalletHandler}>{connButtonText}</button>
			<div>
				<h3>User_Address: {defaultAccount}</h3>
			</div>
      <div>
        <p>Deployer Contract: {contractAddress}</p>
        <p> On : Goerli Testnet </p>
      </div>
            <button onClick={getEvents}>Get Events</button>
			{errorMessage}

{ tb && <CollapsibleTable rows={tb} defaultAccount={defaultAccount}/> }

		</div>
	);
}

export default PoolJS;


ChatGPT: 

This is a smart contract that implements a binary options pool, where users can deposit to either the positive side or the negative side of an event based on their prediction of the outcome. The contract uses a Chainlink oracle to retrieve the price of the underlying asset, which is then used to determine the winning side. The tokens deposited are discounted based on the decay factor, which is a value that decreases over time. The contract has several functions to deposit, settle, redeem, and withdraw funds, as well as to turn on withdrawals and destroy the contract.

Hackathon Requirements

Technically you are not suppossed to use previous work for the hackathon. 
This submission is based on my previous github repos in :
https://github.com/evolF35/edeetado
https://github.com/evolF35/ConstraintsFreeYou


What is different from this github repo is the solidity contract is 
aktered to have less flaws. 

In the old version there was a condition where users can withdraw and exploit 
one side of each market.

In the old version decay did not work. 

ChatGPT explanation of variables

startDate: This is a uint256 variable that stores the timestamp of the block in which the contract was deployed.

settlementDate: This is a uint256 variable that stores the timestamp of the date and time when the bet will be settled.

price: This is an int256 variable that stores the target price of the asset that is being bet on.

oracleAddress: This is an address variable that stores the address of the oracle contract that provides the price of the asset.

decayFactor: This is a uint256 variable that stores the decay factor that is used to calculate the discount for early deposits.

maxRatio: This is a uint256 variable that stores the maximum ratio of the number of ETH deposited to the positive side versus the number of ETH deposited to the negative side.

maxRatioDate: This is a uint256 variable that stores the timestamp of the date and time when withdrawals are allowed if the maxRatio is met.

condition: This is a bool variable that stores the condition of the bet after settlement. If the price of the asset is equal to or greater than the price variable, the condition is set to true.

withdraw: This is a bool variable that stores the state of withdrawals. If the maxRatio is met and the maxRatioDate has passed, the withdraw variable is set to true, allowing withdrawals.

turnToDustDate: This is a uint256 variable that stores the timestamp of the date and time after which the contract can self-destruct.

numDepPos: This is a uint256 variable that stores the total number of ETH deposited to the positive side.

numDepNeg: This is a uint256 variable that stores the total number of ETH deposited to the negative side.

PosAmtDeposited: This is a mapping that maps addresses to uint variables and stores the amount of ETH deposited by each address to the positive side.

NegAmtDeposited: This is a mapping that maps addresses to uint variables and stores the amount of ETH deposited by each address to the negative side.

positiveSide: This is a Claim contract instance that represents the positive side of the bet.

negativeSide: This is a Claim contract instance that represents the negative side of the bet.

oracle: This is an AggregatorV3Interface contract instance that is used to retrieve the price of the asset from the oracle.


Website link: 
https://penn-blockchain-hackathon.vercel.app/



# Create React App

This directory is a brief example of a [Create React App](https://github.com/facebook/create-react-app) site that can be deployed to Vercel with zero configuration.

## Deploy Your Own

Deploy your own Create React App project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/vercel/tree/main/examples/create-react-app&template=create-react-app)

_Live Example: https://create-react-template.vercel.app/_

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.
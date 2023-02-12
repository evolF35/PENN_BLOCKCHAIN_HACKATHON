
import React, { useState } from 'react';
import './App.css';

import DeployPageJS from './Pages/DeployPage';
import PoolPageJS from './Pages/PoolPage';
const ethers = require("ethers")

function App() {
  const [activeComponent, setActiveComponent] = useState('DeployPageJS');

  const handleClick = () => {
    setActiveComponent(activeComponent === 'DeployJS' ? 'OtherComponent' : 'DeployJS');
  };

  let component;
  if (activeComponent === 'DeployJS') {
    component = <DeployPageJS />;
  } else {
    component = <PoolPageJS />;
  }

  return (
    <div className="App">
      <button onClick={handleClick}>Switch</button>
      {/* Render the active component */}
      {component}
      {/* Add a button that calls the "handleClick" function when clicked */}
    </div>
  );
}

export default App;


import React from "react";

import "./App.css";

function App() {
  const alertUser = () => {
    alert("you have been hacked");
  };
  return (
    <div className="App">
      <div>Hello World, This is Flavio Herrera</div>

      <div>
        <div>
          Click the DownLoad Button to download source code for tic tac toe
        </div>

        <br />
        <div>↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓</div>
        <button id="totally not a virus 😳" onClick={() => alertUser()}>
          DownLoad Source Code
        </button>
        <div>↑ ↑ ↑ ↑ ↑ ↑ ↑ ↑</div>
      </div>
    </div>
  );
}

export default App;

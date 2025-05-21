import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import PatientRegistrationForm from "./components/PatientRegistration/PatientRegistrationForm";

function App() {
  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <PatientRegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

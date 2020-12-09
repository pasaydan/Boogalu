import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css"
import Login from "./Components/Login/Login";
import Navigation from "./Components/Navigation/index";
import Homepage from "./Components/Homepage";
import Footer from "./Components/Footer/index";
import Signup from "./Components/Signup";

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Switch>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/signup">
            <Signup />
          </Route>
          <Route path="/home">
            <Homepage />
          </Route>
          <Route path="/">
            <Homepage />
          </Route>
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}
export default App;
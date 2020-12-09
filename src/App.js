import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css"
// import Navbar from "./Navbar"
import Login from "./Components/Login/Login";
import Navigation from "./Components/Navigation/index";
import Section1 from "./Components/Section1/index";
import Dashboard from "./Components/DashBoard/DashBoard";
import Footer from "./Components/Footer/index";
import UserProvider from "./Providers/UserProvider";

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Switch>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/">
              <Dashboard />
            </Route>
          </Switch>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}
export default App;
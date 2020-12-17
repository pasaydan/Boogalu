import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css"
import Login from "./Components/Login/Login";
import SplashScreen from './Components/Splash';
import Navigation from "./Components/Navigation/index";
import Homepage from "./Components/Homepage";
import Footer from "./Components/Footer/index";
import Signup from "./Components/Signup";

function App() {
  const [isSplashVisible, toggleSplash] = useState(true);
  const [transitionOpacityClass, toggleTransition] = useState('');

  useEffect(() => {
    setTimeout(() => {
      toggleSplash(false);
    }, 2500);
    
    setTimeout(() => {
      toggleTransition('visible-transition');
    }, 2800);
  }, []);

  return (
    <Router>
      <div className="App">
        {
          isSplashVisible ?
            <SplashScreen />
          :
            <div className={`main-content-wrapper ${transitionOpacityClass}`}>
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
        }
      </div>
    </Router>
  );
}
export default App;
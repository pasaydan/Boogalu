import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.scss"
import Login from "./Components/Login/Login";
import SplashScreen from './Components/Splash';
import Navigation from "./Components/Navigation/index";
import Homepage from "./Components/Homepage";
import Footer from "./Components/Footer/index";
import Signup from "./Components/Signup";
import Profile from "./Components/Profile/Profile";
import Upcoming from "./Components/Upcoming";
import Competitions from "./Components/Competitions";
import Subscription from "./Components/Subscription";
import EditProfile from "./Components/EditProfile/EditProfile";

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
                <Route exact path="/profile/edit">
                  <EditProfile />
                </Route>
                <Route exact path="/register">
                  <Signup />
                </Route>
                <Route exact path="/lessons">
                  <Upcoming />
                </Route>
                <Route exact path="/competitions">
                  <Competitions />
                </Route>
                <Route exact path="/subscription">
                  <Subscription />
                </Route>
                <Route exact path="/profile">
                  <Profile />
                </Route>
                <Route exact path="/home">
                  <Homepage />
                </Route>
                <Route exact path="/">
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
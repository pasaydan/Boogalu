import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.scss"
import Login from "./Components/Login/Login";
import Feeds from "./Components/Feeds";
import Loader from "./Components/Loader";
import Footer from "./Components/Footer/index";
import Signup from "./Components/Signup";
import Page404 from './Components/Page404';
import Profile from "./Components/Profile/Profile";
import Homepage from "./Components/Homepage";
import Upcoming from "./Components/Upcoming";
import ContactUs from "./Components/Contactus";
import Navigation from "./Components/Navigation/index";
import Competition from "./Components/Admin/Competition"
import EditProfile from "./Components/EditProfile/EditProfile";
import Subscription from "./Components/Admin/Subscription";
import SplashScreen from './Components/Splash';
import Competitions from "./Components/Competitions";
import Notification from "./Components/Notification";
import Subscriptions from "./Components/Subscriptions";
import VideoUploader from "./Components/VideoUploader";
import { useStoreConsumer } from './Providers/StateProvider';

function App() {
  const { state } = useStoreConsumer();
  const [isSplashVisible, toggleSplash] = useState(true);
  const [isRootPath, rootPathToggle] = useState(true);
  const [transitionOpacityClass, toggleTransition] = useState('');
  
  useEffect(() => {
    setTimeout(() => {
      const pathName = window.location.pathname.split('/')[1];
      if (pathName === "") {
        rootPathToggle(true);
      } else {
        rootPathToggle(false);
      }
      toggleSplash(false);
    }, 5000);

    setTimeout(() => {
      toggleTransition('visible-transition');
    }, 5500);
  }, []);

  function routeChanged(event) {
    rootPathToggle(event);
  }

  function isObjectEmpty(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
  }

  return (
    <Router>
      <div className={`App ${isRootPath && isObjectEmpty(state.loggedInUser) ? 'top-padding0': ''}`}>
        {
          isSplashVisible ?
            <SplashScreen />
            :
            <div className={`main-content-wrapper ${transitionOpacityClass}`}>
              <Navigation 
                isUserLoggedIn = {state.loggedInUser && state.loggedInUser.username}
                routeChangeTrigger={(e) => routeChanged(e)}
              />
              <Notification />
              {state?.isLoading && <Loader />}
              <Switch>
                <Route exact path="/contactus">
                  <ContactUs />
                </Route>
                <Route exact path="/login:plan">
                  <Login />
                </Route>
                <Route exact path="/login">
                  <Login />
                </Route>
                <Route exact path="/profile/edit">
                  <EditProfile />
                </Route>
                <Route exact path="/register:plan">
                  <Signup />
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
                  <Subscriptions />
                </Route>
                <Route exact path="/profile">
                  <Profile />
                </Route>
                <Route exact path="/home">
                  {state.loggedInUser && state.loggedInUser.username ? <Feeds /> : <Homepage />}
                </Route>
                <Route exact path="/upload-video">
                  <VideoUploader />
                </Route>
                <Route exact path="/feeds">
                  <Feeds />
                </Route>
                <Route exact path="/">
                  {state.loggedInUser && state.loggedInUser.username ? <Feeds /> : <Homepage />}
                </Route>

                {/* admin routes */}
                <Route exact path="/admin/competition">
                  <Competition />
                </Route>
                <Route exact path="/admin/subscription">
                  <Subscription />
                </Route>

                {/* Handling 404 */}
                <Route>
                  <Page404 />
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
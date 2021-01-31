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
import Competition from "./Components/Admin/Competition"
import Subscriptions from "./Components/Subscriptions";
import EditProfile from "./Components/EditProfile/EditProfile";
import ContactUs from "./Components/Contactus";
import VideoUploader from "./Components/VideoUploader";
import Subscription from "./Components/Admin/Subscription";
import Feeds from "./Components/Feeds";
import Page404 from './Components/Page404';
import Loader from "./Components/Loader";
import { useStoreConsumer } from './Providers/StateProvider';
import Notification from "./Components/Notification";

function App() {
  const { state } = useStoreConsumer();
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
                  <Homepage />
                </Route>
                <Route exact path="/upload-video">
                  <VideoUploader />
                </Route>
                <Route exact path="/feeds">
                  <Feeds />
                </Route>
                <Route exact path="/">
                  <Homepage />
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
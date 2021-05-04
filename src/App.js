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
import AboutUs from './Components/Aboutus';
import ContactUs from "./Components/Contactus";
import Pricing from './Components/Pricing';
import PrivacyPolicy from './Components/PrivacyPolicy';
import Navigation from "./Components/Navigation/index";
import EditProfile from "./Components/EditProfile/EditProfile";
import AdminPanel from './Components/Admin/Admin';
import Competition from "./Components/Admin/Competition"
import Subscription from "./Components/Admin/Subscription";
import UsersInfo from './Components/Admin/Users';
import UploadLessons from './Components/Admin/UploadLessons';
import SplashScreen from './Components/Splash';
import Competitions from "./Components/Competitions";
import Notification from "./Components/Notification";
import Subscriptions from "./Components/Subscriptions";
import VideoUploader from "./Components/VideoUploader";
import { useStoreConsumer } from './Providers/StateProvider';
import TermsConditions from './Components/TermsConditions';
import RefundPolicy from './Components/RefundPolicy';

function App() {
  const { state } = useStoreConsumer();
  const [isSplashVisible, toggleSplash] = useState(true);
  const [isRootPath, rootPathToggle] = useState(true);
  const [adminPathClass, setAdminPathClass] = useState('');
  const [transitionOpacityClass, toggleTransition] = useState('');
  
  useEffect(() => {
    setTimeout(() => {
      const pathName = window.location.pathname.split('/')[1];
      if (pathName === "") {
        rootPathToggle(true);
      } else {
        rootPathToggle(false);
      }

      if (pathName.includes('adminpanel')) {
        setAdminPathClass('adminPanel');
      }

      toggleSplash(false);
    }, 5000);

    setTimeout(() => {
      toggleTransition('visible-transition');
    }, 5100);
  }, []);

  function routeChanged(event) {
    rootPathToggle(event);
  }

  function isObjectEmpty(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
  }

  function callbackHomeFunction() {
    if (isObjectEmpty(state.loggedInUser)) {
      rootPathToggle(true);   
    }
  }

  return (
    <Router>
      <div className={`App ${adminPathClass} ${isRootPath && isObjectEmpty(state.loggedInUser) ? 'top-padding0': ''}`}>
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
                <Route exact path="/aboutus">
                  <AboutUs />
                </Route>
                <Route exact path="/contactus">
                  <ContactUs />
                </Route>
                <Route exact path="/pricing">
                  <Pricing />
                </Route>
                <Route exact path="/privacypolicy">
                  <PrivacyPolicy />
                </Route>
                <Route exact path="/termsandconditions">
                  <TermsConditions />
                </Route>
                <Route exact path="/refundpolicy">
                  <RefundPolicy />
                </Route>
                <Route exact path="/login:plan">
                  <Login />
                </Route>
                <Route exact path="/login">
                  <Login 
                    backToHome={callbackHomeFunction}
                  />
                </Route>
                <Route exact path="/profile/edit">
                  <EditProfile />
                </Route>
                <Route exact path="/register:plan">
                  <Signup 
                    backToHome={callbackHomeFunction}
                  />
                </Route>
                <Route exact path="/register">
                  <Signup 
                    backToHome={callbackHomeFunction}
                  />
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
                <Route exact path="/adminpanel">
                  <AdminPanel />
                </Route>
                <Route exact path="/adminpanel/competition">
                  <Competition />
                </Route>
                <Route exact path="/adminpanel/competitions">
                  <Competition />
                </Route>
                <Route exact path="/adminpanel/subscription">
                  <Subscription />
                </Route>
                <Route exact path="/adminpanel/subscriptions">
                  <Subscription />
                </Route>
                <Route exact path="/adminpanel/lessons">
                  <UploadLessons />
                </Route>
                <Route exact path="/adminpanel/users">
                  <UsersInfo />
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
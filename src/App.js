import logo from './logo.svg';
import './App.css';
import Navigation from './Components/Navigation';
import Footer from './Components/Footer';
import Section1 from './Components/Section1';

function App() {
  return (
    <div className="App">
      <Navigation />
      <Section1 />
      <Footer />   
    </div>
  );
}

export default App;

import logo from './logo.svg';
import './App.css';

import Nav from './components/Nav'
import About from './components/About'
import Home from './components/Tickers'
import Socket from './components/Socket'
import Contact from './components/Contact'
import EnterSecret from './components/EnterSecret'

import { BrowserRouter, Route, Switch, useParams } from 'react-router-dom'

function App() {
    return (
        <BrowserRouter>
                <div className="App">
                <Nav />
                <Switch>    
                    <Route exact path='/' component={Socket} />
                    <Route path='/about' component={About} />
                    <Route path='/contact' component={Contact} />
                    <Route path='/code' component={EnterSecret} />
                   
                    <Route path='*' component={()=>(<div>Oh no!!!! Page not found.</div>)} />
                </Switch>
                </div>
        </BrowserRouter>
    );
}

export default App;

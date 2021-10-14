import './App.sass';

import Nav from './components/Nav'
import About from './components/About'
import Socket from './components/Socket'
import TickerTable from './components/TickerTable'
import Contact from './components/Contact'
import EnterSecret from './components/EnterSecret'

import { BrowserRouter, Route, Switch  } from 'react-router-dom'
function Home() {
    return (
        <div className='main'>
            <TickerTable />
            <Socket />
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
                <div className="App">
                <Nav />
                <Switch>    
                    <Route exact path='/' component={Home} />
                    <Route path='/about' component={About} />
                    <Route path='/contact' component={Contact} />
                    <Route path='/code' component={EnterSecret} />
                    {/* route reddit links to reddit */}
                    <Route path='/r/:subreddit' component={() => { window.location.replace('https://reddit.com/' + window.location.pathname) }} />
                    <Route path='/u/:user' component={() => { window.location.replace('https://reddit.com/' + window.location.pathname) }} />
                   
                    <Route path='*' component={()=>(<div>Oh no!!!! Page not found.</div>)} />
                </Switch>
                </div>
        </BrowserRouter>
    );
}

export default App;

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import JustForToday from './components/JustForToday/JustForToday';
import Login from './components/PairLandingPage/PairLandingPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:date?" exact>
          <JustForToday />
        </Route>
        <Route path="/r/:shareId" exact>
          <JustForToday readOnly />
        </Route>
        <Route path="/pair/:pairId" exact>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import JustForToday from './components/JustForToday/JustForToday';
import PairLandingPage from './components/PairLandingPage/PairLandingPage';
import PrettyCredsSignIn from './components/PrettyCredsSignIn/PrettyCredsSignIn';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/pretty-creds-signin">
          <PrettyCredsSignIn />
        </Route>
        <Route path="/:date?" exact>
          <JustForToday />
        </Route>
        <Route path="/r/:shareId" exact>
          <JustForToday readOnly />
        </Route>
        <Route path="/pair/:pairId" exact>
          <PairLandingPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

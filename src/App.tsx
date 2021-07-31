import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import JustForTodayForm from './components/JustForToday/JustForTodayForm';
import Login from './components/Login/Login';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:date?" exact>
          <JustForTodayForm />
        </Route>
        <Route path="/r/:shareId" exact>
          <JustForTodayForm readOnly />
        </Route>
        <Route path="/login/:loginId" exact>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

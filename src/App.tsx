import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import JustForTodayForm from './components/JustForToday/JustForTodayForm';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/:date?">
          <JustForTodayForm />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import initialState from './initialState';
import tablesReducer from './tablesRedux';

const subreducers = {
  tables: tablesReducer,
};

const reducer = combineReducers(subreducers);

const devtools =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f;

const store = createStore(reducer, initialState, compose(applyMiddleware(thunk), devtools));

export default store;

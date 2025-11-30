import { API_URL } from '../config';

// selectors
export const selectTables = state => state.tables;
export const selectTableById = (state, tableId) =>
  state.tables.find(table => String(table.id) === String(tableId));

// actions
const createActionName = actionName => `app/tables/${actionName}`;
const LOAD_TABLES = createActionName('LOAD_TABLES');

// action creators
export const loadTables = payload => ({ type: LOAD_TABLES, payload });

// thunks
export const fetchTables = () => {
  return dispatch => {
    fetch(`${API_URL}/tables`)
      .then(res => res.json())
      .then(data => dispatch(loadTables(data)))
      .catch(err => console.error('Failed to fetch tables', err));
  };
};

// reducer
const tablesReducer = (statePart = [], action) => {
  switch (action.type) {
    case LOAD_TABLES:
      return [...action.payload];
    default:
      return statePart;
  }
};

export default tablesReducer;

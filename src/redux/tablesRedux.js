import { API_URL } from '../config';

// selectors
export const selectTables = state => state.tables;
export const selectTableById = (state, tableId) =>
  state.tables.find(table => String(table.id) === String(tableId));

// actions
const createActionName = actionName => `app/tables/${actionName}`;
const LOAD_TABLES = createActionName('LOAD_TABLES');
const UPDATE_TABLE = createActionName('UPDATE_TABLE');

// action creators
export const loadTables = payload => ({ type: LOAD_TABLES, payload });
export const updateTable = payload => ({ type: UPDATE_TABLE, payload });

// thunks
export const fetchTables = () => {
  return dispatch => {
    fetch(`${API_URL}/tables`)
      .then(res => res.json())
      .then(data => dispatch(loadTables(data)))
      .catch(err => console.error('Failed to fetch tables', err));
  };
};

export const updateTableRequest = tableData => {
  return dispatch => {
    return fetch(`${API_URL}/tables/${tableData.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableData),
    })
      .then(res => res.json())
      .then(updated => dispatch(updateTable(updated)))
      .catch(err => console.error('Failed to update table', err));
  };
};

// reducer
const tablesReducer = (statePart = [], action) => {
  switch (action.type) {
    case LOAD_TABLES:
      return [...action.payload];
    case UPDATE_TABLE:
      return statePart.map(table => (String(table.id) === String(action.payload.id) ? action.payload : table));
    default:
      return statePart;
  }
};

export default tablesReducer;

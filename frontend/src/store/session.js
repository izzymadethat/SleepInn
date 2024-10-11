import { csrfFetch } from "./csrf";

const ACTIONS = {
  GET_CURRENT_USER: "session/GET_CURRENT_USER",
  REMOVE_CURRENT_USER: "session/REMOVE_CURRENT_USER",
};

const getUserAction = (user) => {
  return {
    type: ACTIONS.GET_CURRENT_USER,
    payload: user,
  };
};

const removeUserAction = () => {
  return {
    type: ACTIONS.REMOVE_CURRENT_USER,
  };
};

export const loginUser = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({ credential, password }),
  });
  const data = await response.json();
  dispatch(getUserAction(data.user));
  return response;
};

export const logoutUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session", {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeUserAction());
  }
};

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.GET_CURRENT_USER:
      return { ...state, user: action.payload };
    case ACTIONS.REMOVE_CURRENT_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default sessionReducer;

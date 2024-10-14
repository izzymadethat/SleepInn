import { csrfFetch } from "./csrf";

const SET_SPOTS = "spots/SET_SPOTS";
const ADD_SPOT = "spots/ADD_SPOT";
const UPDATE_SPOT = "spots/UPDATE_SPOT";
const DELETE_SPOT = "spots/DELETE_SPOT";

// Action Creators
export const setSpots = (spots) => {
  return {
    type: SET_SPOTS,
    payload: spots
  };
};

export const addSpot = (spot) => {
  return {
    type: ADD_SPOT,
    payload: spot
  };
};

export const fetchSpots = () => (dispatch) => {
  csrfFetch("/api/spots")
    .then((response) => response.json())
    .then((data) => dispatch(setSpots(data.Spots)))
    .catch((error) => console.error(error));
};

const initialState = {
  byId: {},
  allSpots: []
};

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SPOTS: {
      const { byId, allSpots } = _normalizeSpots(action.payload);
      return {
        ...state,
        byId,
        allSpots
      };
    }
    default:
      return state;
  }
};

/**
 * I am using a helper function to normalize the spot data so that it can be easily accessed by id.
 * @param {Array} spots
 */
function _normalizeSpots(spots) {
  const byId = {};
  const allSpots = [];

  spots.forEach((spot) => {
    byId[spot.id] = spot;
    allSpots.push(spot);
  });

  return { byId, allSpots };
}

export default spotsReducer;

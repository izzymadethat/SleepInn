import { csrfFetch } from "./csrf";

const SET_SPOTS = "spots/SET_SPOTS";
const ADD_SPOT = "spots/ADD_SPOT";
const SET_SPOT_DETAILS = "spots/GET_SPOT_DETAILS";
const SET_SPOT_REVIEWS = "spots/SET_SPOT_REVIEWS";
const UPDATE_SPOT = "spots/UPDATE_SPOT";
const DELETE_SPOT = "spots/DELETE_SPOT";

// Action Creators
export const setSpots = (spots) => {
  return {
    type: SET_SPOTS,
    payload: spots
  };
};

export const setSpotDetails = (spot) => {
  return {
    type: SET_SPOT_DETAILS,
    payload: spot
  };
};

export const setSpotReviews = (reviews) => {
  return {
    type: SET_SPOT_REVIEWS,
    payload: reviews
  };
};

// Action Functions
export const addSpotAction = (spot) => {
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

export const fetchSpotDetails = (spotId) => (dispatch) => {
  csrfFetch(`/api/spots/${spotId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Spot details that came in: ", data);
      dispatch(setSpotDetails(data));
    })
    .catch((error) => console.error(error));

  csrfFetch(`/api/spots/${spotId}/reviews`)
    .then((response) => response.json())
    .then((reviewData) => {
      console.log("Reviews that came in: ", reviewData);
      dispatch(setSpotReviews(reviewData.Reviews));
    })
    .catch((error) => console.error(error));
};

export const addSpot = (spotDetails, imageDetails) => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/spots", {
      method: "POST",
      body: JSON.stringify(spotDetails)
    });

    const spotData = await response.json();
    console.log("Spot data that came in: ", spotData);
    dispatch(addSpotAction(spotData));

    const imageResponse = await csrfFetch(`/api/spots/${spotData.id}/images`, {
      method: "POST",
      body: JSON.stringify(imageDetails)
    });

    const imageData = await imageResponse.json();

    return { spot: spotData, image: imageData };
  } catch (error) {
    console.error(error);
    return error.errors;
  }
};

const initialState = {
  byId: {},
  allSpots: [],
  spotDetails: null
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

    case SET_SPOT_DETAILS: {
      return {
        ...state,
        spotDetails: action.payload || {}
      };
    }

    case SET_SPOT_REVIEWS: {
      const updatedSpotDetails = {
        ...state.spotDetails,
        Reviews: action.payload
      };

      return {
        ...state,
        spotDetails: updatedSpotDetails
      };
    }

    case ADD_SPOT: {
      const { byId, allSpots } = _normalizeSpots([action.payload]);
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

import { csrfFetch } from "./csrf";

const SET_SPOTS = "spots/SET_SPOTS";
const ADD_SPOT = "spots/ADD_SPOT";
const SET_SPOT_DETAILS = "spots/GET_SPOT_DETAILS";
const SET_SPOT_REVIEWS = "spots/SET_SPOT_REVIEWS";
const ADD_SPOT_IMAGE = "spots/ADD_SPOT_IMAGE";
const SET_SPOT_IMAGES = "spots/ADD_SPOT_IMAGE";
// const UPDATE_SPOT = "spots/UPDATE_SPOT";
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

export const setSpotImages = (images) => {
  return {
    type: SET_SPOT_IMAGES,
    payload: images
  };
};

export const deleteSpotAction = (spotId) => {
  return {
    type: DELETE_SPOT,
    payload: spotId
  };
};

export const addSpotAction = (spot) => {
  return {
    type: ADD_SPOT,
    payload: spot
  };
};

export const addSpotImage = (image) => {
  return {
    type: ADD_SPOT_IMAGE,
    payload: image
  };
};

// Action Functions
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
      dispatch(setSpotDetails(data));
    })
    .catch((error) => console.error(error));

  csrfFetch(`/api/spots/${spotId}/reviews`)
    .then((response) => response.json())
    .then((reviewData) => {
      dispatch(setSpotReviews(reviewData.Reviews));
    })
    .catch((error) => console.error(error));
};

export const addSpot = (spotDetails, imageUrls) => async (dispatch) => {
  try {
    // Create the spot first so that I can have a spot id to add to image
    const response = await csrfFetch("/api/spots", {
      method: "POST",
      body: JSON.stringify(spotDetails)
    });
    const spotData = await response.json();
    dispatch(addSpotAction(spotData));

    // Upload all images for the spot
    for (const url of imageUrls) {
      const imgDetails = {
        url,
        spotId: spotData.id,
        preview: url === imageUrls[0]
      };

      const imageResponse = await csrfFetch(
        `/api/spots/${spotData.id}/images`,
        {
          method: "POST",
          body: JSON.stringify(imgDetails)
        }
      );

      const imageData = await imageResponse.json();
      dispatch(addSpotImage(imageData));
    }
    return { spot: spotData };
  } catch (error) {
    console.error(error);
    return error.errors;
  }
};

export const deleteSpot = (spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      dispatch(deleteSpotAction());
      return true;
    } else {
      return false;
    }
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
        byId: { ...state.byId, ...byId },
        allSpots: [...state.allSpots, ...allSpots]
      };
    }

    case ADD_SPOT_IMAGE: {
      const { id, spotId, url, preview } = action.payload;

      // Update the spot in the byId object
      const updatedSpot = {
        ...state.byId[spotId],
        images: [...(state.byId[spotId]?.images || []), { id, url, preview }]
      };

      // Update the spot in the allSpots array
      const updatedAllSpots = state.allSpots.map((spot) =>
        spot.id === spotId
          ? { ...spot, images: [...(spot.images || []), { id, url, preview }] }
          : spot
      );

      return {
        ...state,
        byId: { ...state.byId, [spotId]: updatedSpot },
        allSpots: updatedAllSpots
      };
    }

    case DELETE_SPOT: {
      const { [action.payload]: removed, ...restOfById } = state.byId;
      const updatedAllSpots = state.allSpots.filter(
        (spot) => spot.id !== action.payload
      );
      console.log("Spot Removed", removed);
      return {
        ...state,
        byId: restOfById,
        allSpots: updatedAllSpots
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

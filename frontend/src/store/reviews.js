import { csrfFetch } from "./csrf";

const SET_REVIEWS = "reviews/SET_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const DELETE_REVIEW = "reviews/DELETE_REVIEW";
const SET_REVIEW_ERROR = "reviews/SET_REVIEW_ERROR";

export const setReviews = (reviews) => {
  return {
    type: SET_REVIEWS,
    payload: reviews
  };
};

export const addReview = (review) => {
  return {
    type: ADD_REVIEW,
    payload: review
  };
};

export const deleteReview = (reviewId) => {
  return {
    type: DELETE_REVIEW,
    payload: reviewId
  };
};

export const setReviewError = (error) => {
  return {
    type: SET_REVIEW_ERROR,
    payload: error
  };
};

export const fetchReviews = (spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
    const data = await response.json();
    console.log(`REVIEW DATA FOR SPOT ID ${spotId}`, data.Reviews);
    dispatch(setReviews(data.Reviews));
  } catch (error) {
    dispatch(setReviewError(error.errors || "Error deleting review"));
  }
};

export const addNewReview = (spotId, review) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review)
    });

    if (response.ok) {
      const newReview = await response.json();
      dispatch(addReview(newReview));
      return newReview;
    } else {
      const errorData = await response.json();
      return errorData.errors;
    }
  } catch (error) {
    return error.errors || ["Error adding review"];
  }
};

export const removeReview = (spotId, reviewId) => async (dispatch) => {
  try {
    const response = await csrfFetch(
      `/api/spots/${spotId}/reviews/${reviewId}`,
      {
        method: "DELETE"
      }
    );

    if (response.ok) {
      dispatch(deleteReview(reviewId));
      return true;
    } else {
      const data = await response.json();
      dispatch(setReviewError(data.errors || "Error deleting review"));
    }
  } catch (error) {
    dispatch(setReviewError(error.errors || "Error deleting review"));
  }
};

const initialState = {
  reviewsBySpot: {},
  error: null
};

const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_REVIEWS: {
      const { payload } = action;
      const spotId = payload.length > 0 ? payload[0].spotId : null;
      if (!spotId) return state;
      return {
        ...state,
        reviewsBySpot: {
          ...state.reviewsBySpot,
          [spotId]: payload
        },
        error: null
      };
    }

    case ADD_REVIEW: {
      const { payload } = action;
      const { spotId } = payload;
      return {
        reviewsBySpot: {
          ...state.reviewsBySpot,
          [spotId]: [payload, ...(state.reviewsBySpot[spotId] || [])]
        },
        error: null
      };
    }

    case DELETE_REVIEW: {
      const { payload: reviewId } = action;
      let spotId = null;

      // Find the spotId that contains the review to delete
      for (const id of Object.keys(state.reviewsBySpot)) {
        const reviews = state.reviewsBySpot[id];
        if (reviews.find((review) => review.id === reviewId)) {
          spotId = id;
          break; // Exit the loop once the spotId is found
        }
      }

      if (!spotId) return state; // If no spotId found, return current state

      // Filter out the deleted review from the reviews array
      return {
        ...state,
        reviewsBySpot: {
          ...state.reviewsBySpot,
          [spotId]: state.reviewsBySpot[spotId].filter(
            (review) => review.id !== reviewId
          )
        },
        error: null
      };
    }

    case SET_REVIEW_ERROR: {
      return {
        ...state,
        error: action.payload
      };
    }

    default:
      return state;
  }
};

export default reviewsReducer;

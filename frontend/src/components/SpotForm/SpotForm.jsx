import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as spotActions from "../../store/spots";
import "./SpotForm.css";

function validateForm(formData) {
  const errors = {};
  if (!formData.name) {
    errors.name = "Please enter a name for your spot";
  }
  if (!formData.address) {
    errors.address = "Please enter an address for your spot";
  }
  if (!formData.city) {
    errors.city = "Please enter a city for your spot";
  }
  if (!formData.state) {
    errors.state = "Please enter a state for your spot";
  }
  if (!formData.lat) {
    errors.lat = "Please enter a latitude for your spot";
  }
  if (!formData.lng) {
    errors.lng = "Please enter a longitude for your spot";
  }
  if (!formData.price) {
    errors.price = "Please enter a price for your spot";
  }
  if (!formData.description) {
    errors.description = "Please enter a description for your spot";
  }
  if (!formData.previewImage) {
    errors.previewImage = "Please upload a preview image for your spot";
  }
  if (formData.images.length < 1) {
    errors.images = "Please upload at least one image for your spot";
  }
  return errors;
}

const SpotForm = () => {
  const navigate = useNavigate();
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const spot = useSelector((state) => state.spots.spotDetails);
  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    state: "",
    lat: "",
    lng: "",
    description: "",
    name: "",
    price: "",
    previewImage: "",
    images: []
  });
  const [isEdit] = useState(!!spotId);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (spotId && isEdit) {
      dispatch(spotActions.fetchSpotDetails(spotId));
    }
  }, [dispatch, spotId, isEdit]);

  useEffect(() => {
    if (isEdit && spot) {
      // Populate the form once the spot data is available
      setFormData({
        country: spot.country || "",
        address: spot.address || "",
        city: spot.city || "",
        state: spot.state || "",
        lat: spot.lat ? spot.lat.toString() : "",
        lng: spot.lng ? spot.lng.toString() : "",
        description: spot.description || "",
        name: spot.name || "",
        price: spot.price ? spot.price.toString() : "",
        previewImage: spot.SpotImages.find((img) => img.preview)?.url || "",
        images:
          spot.SpotImages.filter((img) => !img.preview).map((img) => img.url) ||
          []
      });
    }
  }, [spot, isEdit]);

  if (!user) {
    return navigate("/", {
      state: { error: "Please login to create a spot" },
      replace: true
    });
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (index, value) => {
    console.log("CHANGING IMAGE", index, value);
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const spotData = {
      ...formData,
      price: parseFloat(formData.price),
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };
    const imageUrls = [formData.previewImage, ...formData.images];

    try {
      if (isEdit) {
        await dispatch(spotActions.updateSpot(spotId, spotData, imageUrls));
        await dispatch(spotActions.fetchSpotDetails(spotId));
        navigate(`/spots/${spotId}`);
      } else {
        const res = await dispatch(spotActions.addSpot(spotData, imageUrls));
        navigate(`/spots/${res.spot.id}`); // Ensure you're referencing the correct property
      }
    } catch (error) {
      const errorRes = await error.json();
      setErrors(errorRes.errors || {});
    }
  };

  return (
    <main className="container">
      <div className="container__header">
        <h1 data-testid="form-title">
          {isEdit ? "Update your Spot" : "Create a New Spot"}
        </h1>
      </div>
      <form
        className="create-spot-form"
        onSubmit={handleSubmit}
        data-testid={!isEdit ? "create-spot-form" : "update-spot-form"}
      >
        {/* Section 1 */}
        <div className="form-group" data-testid="section-1">
          <div className="form__section-header">
            <h2 data-testid="section-1-heading">
              Where&apos;s your place located?
            </h2>
            <p data-testid="section-1-caption">
              Guests will only get your exact address once they booked a
              reservation.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={handleInputChange}
              name="country"
              placeholder="Country"
              className={errors.country ? "error-input" : ""}
              required
            />
            {errors.country && <p className="error">{errors.country}</p>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  className={errors.address ? "error-input" : ""}
                  required
                />
                {errors.address && <p className="error">{errors.address}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? "error-input" : ""}
                  required
                />
                {errors.city && <p className="error">{errors.city}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className={errors.state ? "error-input" : ""}
                  required
                />
                {errors.state && <p className="error">{errors.state}</p>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude (Optional)</label>
                <input
                  type="number"
                  step={"any"}
                  id="latitude"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  placeholder="Latitude"
                  className={errors.lat ? "error-input" : ""}
                />
                {errors.lat && <p className="error">{errors.lat}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude (Optional)</label>
                <input
                  type="number"
                  step={"any"}
                  id="longitude"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  placeholder="Longitude"
                  className={errors.lng ? "error-input" : ""}
                />
                {errors.lng && <p className="error">{errors.lng}</p>}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* Section 2 */}
        <div className="form-group" data-testid="section-2">
          <div className="form__section-header">
            <h2 data-testid="section-2-heading">
              Describe your place to guests
            </h2>
            <p data-testid="section-2-caption">
              Mention the best features of your space, any special amentities
              like fast wifi or parking, and what you love about the
              neighborhood.
            </p>
          </div>
          <textarea
            id="description"
            name="description"
            rows="4"
            placeholder="Please write at least 30 characters"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? "error-input" : ""}
            required
          ></textarea>
          {errors.description && <p className="error">{errors.description}</p>}
        </div>

        <hr />

        {/* Section 3 */}
        <div className="form-group" data-testid="section-3">
          <div className="form__section-header">
            <h2 data-testid="section-3-heading">
              Create a title for your spot
            </h2>
            <p data-testid="section-3-caption">
              Catch guests&apos; attention with a spot title that highlights
              what makes your place special.
            </p>
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name of your spot"
            className={errors.name ? "error-input" : ""}
            required
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <hr />
        {/* Section 4 */}
        <div className="form-group" data-testid="section-4">
          <div className="form__section-header">
            <h2 data-testid="section-4-heading">
              Set a base price for your spot
            </h2>
            <p data-testid="section-4-caption">
              Competitive pricing can help your listing stand out and rank
              higher in search results.
            </p>
          </div>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Price per night (USD)"
            className={errors.price ? "error-input" : ""}
            required
          />
          {errors.price && <p className="error">{errors.price}</p>}
        </div>
        <hr />

        {/* Section 5 */}
        <div data-testid="section-5">
          <div className="form__section-header">
            <h2 data-testid="section-5-heading">
              Liven up your spot with photos
            </h2>
            <p data-testid="section-5-caption">
              Submit a link to at least one photo to publish your spot.
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="image-preview">Preview Image URL</label>
            <input
              type="url"
              id="previewImage"
              name="previewImage"
              value={formData.previewImage}
              onChange={handleInputChange}
              placeholder="Preview Image URL"
              className={errors.previewImage ? "error-input" : ""}
              required
            />
            {errors.previewImage && (
              <p className="error">{errors.previewImage}</p>
            )}
          </div>

          {/* TODO: Add image upload functionality */}
          <div className="form-group">
            <label htmlFor="image-1">Image URL</label>
            <input
              type="url"
              id="image-1"
              name="image-1"
              placeholder="Image URL"
              value={formData.images[0] || ""}
              onChange={(e) => handleImageChange(0, e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="image-2">Image URL</label>
            <input
              type="url"
              id="image-2"
              name="image-2"
              placeholder="Image URL"
              value={formData.images[1] || ""}
              onChange={(e) => handleImageChange(1, e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="image-3">Image URL</label>
            <input
              type="url"
              id="image-3"
              name="image-3"
              placeholder="Image URL"
              value={formData.images[2] || ""}
              onChange={(e) => handleImageChange(2, e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="image-3">Image URL</label>
            <input
              type="url"
              id="image-4"
              name="image-4"
              placeholder="Image URL"
              value={formData.images[2] || ""}
              onChange={(e) => handleImageChange(3, e.target.value)}
            />
          </div>
        </div>
        <hr />
        <button type="submit" className="submit-btn">
          {isEdit ? "Update Spot" : "Create Spot"}
        </button>
      </form>
    </main>
  );
};

export default SpotForm;

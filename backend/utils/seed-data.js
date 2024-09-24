const bcrypt = require("bcryptjs");

// Generate seed data for users
const userSeed = [
  {
    email: "demo@user.io",
    username: "Demo-lition",
    firstName: "Demo",
    lastName: "lition",
    hashedPassword: bcrypt.hashSync("password"),
  },
  {
    email: "user1@user.io",
    username: "FakeUser1",
    firstName: "Fake",
    lastName: "User",
    hashedPassword: bcrypt.hashSync("password2"),
  },
  {
    email: "user2@user.io",
    username: "FakeUser2",
    firstName: "Faker",
    lastName: "User",
    hashedPassword: bcrypt.hashSync("password3"),
  },
];

// Generate seed data for spots
const spotSeed = [
  {
    ownerId: 1,
    address: "123 Disney Lane",
    city: "San Francisco",
    state: "California",
    country: "United States of America",
    lat: 37.7645358,
    lng: -122.4730327,
    name: "App Academy",
    description: "Place where web developers are created",
    price: 123,
  },
];

const reviewSeed = [
  {
    userId: 2,
    spotId: 1,
    review: "This place gives me the creeps!!",
    stars: 1.5,
  },
];

const bookingSeed = [
  {
    spotId: 1,
    userId: 2,
    startDate: "2031-11-30",
    endDate: "2031-12-05",
  },
  {
    spotId: 1,
    userId: 3,
    startDate: "2031-10-24",
    endDate: "2031-10-25",
  },
];
// const imageSeed = [
//   {
//     userId: 1,
//     url: "https://placehold.co/600x400/png",
//     spotId: 1,
//   },
//   {
//     userId: 1,
//     url: "https://placehold.co/600x400/png",
//     spotId: 2,
//   },
//   {
//     userId: 1,
//     url: "https://placehold.co/600x400/png",
//     spotId: 3,
//   },
//   {
//     userId: 3,
//     url: "https://placehold.co/600x400/png",
//     spotId: 4,
//   },
//   {
//     userId: 3,
//     url: "https://placehold.co/600x400/png",
//     spotId: 5,
//   },
//   {
//     userId: 2,
//     url: "https://placehold.co/600x400/png",
//     reviewId: 1,
//   },
//   {
//     userId: 1,
//     url: "https://placehold.co/600x400/png",
//     reviewId: 2,
//   },
//   {
//     userId: 3,
//     url: "https://placehold.co/600x400/png",
//     reviewId: 3,
//   },
// ];
const spotImageSeed = [
  {
    spotId: 1,
    preview: true,
    url: "https://placehold.co/600x400/png",
  },
  {
    spotId: 1,
    url: "https://placehold.co/600x400/png",
  },
];

// const maxReviewImage = () => {
//   let max = 10;
//   for (let i = 0; i < max; i++) {
//     reviewImageSeed.push({
//       reviewId: 2,
//       url: "https://placehold.co/600x400/png",
//     });
//   }
// };

const reviewImageSeed = [
  {
    reviewId: 1,
    url: "https://placehold.co/600x400/png",
  },
];

module.exports = {
  userSeed,
  spotSeed,
  reviewSeed,
  bookingSeed,
  // imageSeed,
  spotImageSeed,
  reviewImageSeed,
};

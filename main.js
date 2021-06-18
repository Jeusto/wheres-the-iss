var crg = require("country-reverse-geocoding").country_reverse_geocoding();

// Define variables
let globe;
let current_country;
let latitude;
let longitude;
let overlay;

// Get dom elements
const current_country_text = document.querySelector("#current_country");
const current_coordinates_text = document.querySelector("#current_coordinates");
const coordinates_link = document.querySelector("#coordinates_link");
const theme = document.getElementById("theme");
const map = document.getElementById("map");
const body = document.querySelector("body");

// When miniature earth finishes loadign
window.addEventListener("earthjsload", function () {
  // Create globe
  globe = new Earth(document.getElementById("element"), {
    location: { lat: 18, lng: 50 },
    zoom: 1.05,
    light: "none",
    transparent: false,
    mapSeaColor: "#61afef",
    mapLandColor: "#98c379",
    mapBorderColor: "#537c36",
    mapBorderWidth: 0.25,
    mapHitTest: true,
    rotating: false,
  });

  // Update map texture
  globe.addEventListener("ready", function () {
    updateMapTexture();
  });

  // Display first location
  fetch("https://api.wheretheiss.at/v1/satellites/25544")
    .then((response) => response.json())
    .then((data) => {
      // Save coordinates
      latitude = parseFloat(data.latitude);
      longitude = parseFloat(data.longitude);

      // Display iss current location on globe
      overlay = globe.addOverlay({
        location: { lat: latitude, lng: longitude },
        depthScale: 0.4,
        className: "hotspot",
      });

      // Display trail behind
      trail = globe.addOverlay({
        location: { lat: latitude, lng: longitude },
        depthScale: 0.4,
        className: "trail",
      });

      // Focus into the current location
      globe.goTo(
        { lat: latitude, lng: longitude },
        { duration: 250, relativeDuration: 70 }
      );

      // Check over which country the iss is
      current_country = crg.get_country(latitude, longitude);

      // Display the country name
      current_country_text.innerHTML = `${
        current_country == null ? "water" : current_country.name
      }`;

      // Display the coordinates
      current_coordinates_text.innerHTML = `${overlay.location.lat}, ${overlay.location.lng}`;
      coordinates_link.href = `https://www.google.fr/maps/place/${overlay.location.lat}, ${overlay.location.lng}`;
    });

  // Every 5 seconds fetch iss location from api
  setInterval(() => {
    fetch("https://api.wheretheiss.at/v1/satellites/25544")
      .then((response) => response.json())
      .then((data) => {
        // Save coordinates
        latitude = parseFloat(data.latitude);
        longitude = parseFloat(data.longitude);

        // Display iss current location on globe
        overlay.options.location = { lat: latitude, lng: longitude };

        // Display trail behind
        trail = globe.addOverlay({
          location: { lat: latitude, lng: longitude },
          depthScale: 0.4,
          className: "trail",
        });

        // Focus into the current location
        globe.goTo(
          { lat: latitude, lng: longitude },
          { duration: 250, relativeDuration: 70 }
        );

        // Check over which country the iss is
        current_country = crg.get_country(latitude, longitude);

        // Display the country name
        current_country_text.innerHTML = `${
          current_country == null ? "water" : current_country.name
        }`;

        // Display the coordinates
        current_coordinates_text.innerHTML = `${overlay.location.lat}, ${overlay.location.lng}`;
        coordinates_link.href = `https://www.google.fr/maps/place/${overlay.location.lat}, ${overlay.location.lng}`;
      });
  }, 5000);
});

// Function to update map texture
function updateMapTexture() {
  let w = globe.mapCanvas.width,
    h = globe.mapCanvas.height;
  globe.mapContext.drawImage(map, 0, 0, map.width, map.height, 0, 0, w, h);
  globe.updateMap();
}

// Change theme when clicking button
theme.addEventListener("click", function () {
  if (theme.src.includes("day.svg")) {
    theme.src = theme.src.replace("day.svg", "night.svg");
    map.src = map.src.replace("day.png", "night.jpg");
    body.classList.add("dark");
    setTimeout(() => {
      updateMapTexture();
    }, 200);
  } else {
    theme.src = theme.src.replace("night.svg", "day.svg");
    map.src = map.src.replace("night.jpg", "day.png");
    body.classList.remove("dark");
    setTimeout(() => {
      updateMapTexture();
    }, 200);
  }
});

setTimeout(() => {
  updateMapTexture();
}, 1000);

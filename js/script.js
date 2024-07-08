const ENDPOINT = "http://localhost:3000/api/yelp";

// Define parameters for the search
const PARAMETERS = {
  term: "food",
  location: "Troy, New York",
  limit: 50,
  open_now: true,
};

// Construct the URL with parameters
const url = new URL(ENDPOINT);
Object.keys(PARAMETERS).forEach((key) =>
  url.searchParams.append(key, PARAMETERS[key])
);

// Make the request to the Yelp API via the proxy server
fetch(url)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    console.log(data); // Handle the response data
    // For example, you can display the results on the web page
    const resultsContainer = document.createElement("div");
    data.businesses.forEach((business) => {
      const businessDiv = document.createElement("div");
      businessDiv.innerHTML = `<h3>${business.name}</h3><p>${business.location.address1}</p><p>Rating: ${business.rating}</p><img src="${business.image_url}" style="width:50%"></img><p>Phone:${business.display_phone}</p>`;
      resultsContainer.appendChild(businessDiv);
    });
    document.body.appendChild(resultsContainer);
  })
  .catch((error) => {
    console.error("There has been a problem with your fetch operation:", error);
  });

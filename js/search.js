
document.addEventListener('DOMContentLoaded', async () => {
    const searchBar = document.getElementById('searchBar');
    const restaurantList = document.getElementById('restaurantList');
    const filters = document.querySelectorAll('.filters input[type="checkbox"]');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    const addAllButtonRestaurants = document.getElementById('addAllButtonRestaurants');

    // Process restaurant data
    function getRestaurants() {
        //const db_file = "db_files/twenty_restaurants.json";
        const db_file = "http://localhost:3000/db"
        
        fetch(db_file)
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .catch(function () {
            this.dataError = true;
        })
    }

    async function waitForRestaurants() {
        try {
          const restaurants_json = getRestaurants();
          return restaurants_json;
        } catch(error) {
          return null;
        }
    }

    let restaurants = await waitForRestaurants();

    // If not within range of server
    if (restaurants == null) {
        restaurants = [
            // Array of restaurants with the following properties: id, name, distance, cuisine, rating, price, opening
            {"id":"1","name":"Nighthawks","distance":"515","cuisine":"Burgers","rating":4.2,"price":"$$","opening":"Afternoon"},
            {"id":"2","name":"The Roosevelt Room","distance":"515","cuisine":"Steakhouses","rating":4.6,"price":null,"opening":"Afternoon"},
            {"id":"3","name":"Lo Porto's","distance":"628","cuisine":"Italian","rating":4.3,"price":"$$","opening":"Afternoon"},
            {"id":"4","name":"Sunhee's Farm and Kitchen","distance":"515","cuisine":"Burgers","rating":4.4,"price":"$$","opening":"Afternoon"},
            {"id":"5","name":"Whiskey Pickle","distance":"601","cuisine":"Sandwiches","rating":4.8,"price":null,"opening":"Afternoon"},
            {"id":"6","name":"Naughter's","distance":"527","cuisine":"Sandwiches","rating":4.7,"price":null,"opening":"Afternoon"},
            {"id":"7","name":"Ali Baba","distance":"776","cuisine":"Mediterranean","rating":4.5,"price":"$$","opening":"Afternoon"},
            {"id":"8","name":"Sea Smoke Waterfront Grill","distance":"986","cuisine":"Mediterranean","rating":3.4,"price":null,"opening":"Afternoon"},
            {"id":"9","name":"The Ruck","distance":"778","cuisine":"Burgers","rating":3.8,"price":"$$","opening":"Afternoon"},
            {"id":"10","name":"Mex Cocina La Catrina","distance":"849","cuisine":"Mexican","rating":5,"price":"$$","opening":"Afternoon"},
            {"id":"11","name":"DeFazio's Pizzeria","distance":"1078","cuisine":"Pizza","rating":4.4,"price":"$$","opening":"Afternoon"},
            {"id":"12","name":"K Plate Korean Street Food","distance":"594","cuisine":"Korean","rating":4.4,"price":"$","opening":"Afternoon"},
            {"id":"13","name":"La Capital Tacos","distance":"759","cuisine":"Latin America","rating":4.7,"price":null,"opening":"Afternoon"},
            {"id":"14","name":"Unagi Sushi","distance":"594","cuisine":"Korean","rating":null,"price":"$$","opening":"Afternoon"},
            {"id":"15","name":"Dinosaur Bar-B-Que","distance":"789","cuisine":"BBQ","rating":3.7,"price":"$$","opening":"Afternoon"},
            {"id":"16","name":"Kuma Ani","distance":"519","cuisine":"Ramen","rating":4.5,"price":null,"opening":"Afternoon"},
            {"id":"17","name":"The Hill Beer & Wine Garden","distance":"854","cuisine":"Bars","rating":4.5,"price":"$$","opening":"Afternoon"},
            {"id":"18","name":"Tatu Tacos & Tequila","distance":"1261","cuisine":"Mexican","rating":null,"price":null,"opening":"Afternoon"},
            {"id":"19","name":"Finn’s","distance":"1261","cuisine":"Bars","rating":4.5,"price":null,"opening":"Afternoon"},
            {"id":"20","name":"Taqueria Tren Maya","distance":"1261","cuisine":"Mexican","rating":null,"price":null,"opening":"Afternoon"}
            // Add more restaurants here
        ];
    }

    

    // Function to check if the restaurant is currently open
    function isOpen(openingTime) {
        const currentHour = new Date().getHours();
        if (openingTime === 'Morning' && currentHour >= 6 && currentHour < 12) return true;
        if (openingTime === 'Afternoon' && currentHour >= 12 && currentHour < 18) return true;
        if (openingTime === 'Evening' && currentHour >= 18 && currentHour < 24) return true;
        return false;
    }

    // Function to display the list of restaurants
    function displayRestaurants(filteredRestaurants) {
        restaurantList.innerHTML = '';
        if (filteredRestaurants.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results';
            noResultsMessage.textContent = 'There are no restaurants that match your search. Please try again.';
            restaurantList.appendChild(noResultsMessage);
            return;
        }

        filteredRestaurants.forEach(restaurant => {
            const restaurantItem = document.createElement('div');
            restaurantItem.className = 'restaurant-item';

            const restaurantName = document.createElement('div');
            restaurantName.textContent = restaurant.name;
            restaurantName.className = 'restaurant-name';

            // Create the info container that is shown by default
            const info = document.createElement('div');
            info.className = 'info';
            info.innerHTML = `
                <p>Distance: ${restaurant.distance}</p>
                <p>Cuisine: ${restaurant.cuisine}</p>
                <p>Rating: ${restaurant.rating}</p>
                <p>Price: ${restaurant.price}</p>
                <p>Opening Time: ${restaurant.opening}</p>
            `;

            // Create the image container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';
            const img = document.createElement('img');
            img.src = '/imgs/food_stock_image.jpg'; // Replace with actual image path
            img.alt = 'Restaurant Image';
            imgContainer.appendChild(img);

            // Create the checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'add-to-list';
            checkbox.id = `checkbox-${restaurant.id}`;
            checkbox.addEventListener('change', () => {
                const listFrame = parent.document.getElementById('listFrame').contentWindow;
                if (checkbox.checked) {
                    listFrame.postMessage({ type: 'addRestaurant', restaurant: restaurant }, '*');
                } else {
                    listFrame.postMessage({ type: 'removeRestaurant', restaurant: restaurant }, '*');
                }
            });

            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            checkboxContainer.appendChild(checkbox);

            // Append elements to the restaurant item
            restaurantItem.appendChild(restaurantName);
            restaurantItem.appendChild(info);
            restaurantItem.appendChild(imgContainer);
            restaurantItem.appendChild(checkboxContainer);
            restaurantList.appendChild(restaurantItem);

            // Add to list on click
            restaurantItem.addEventListener('click', (event) => {
                if (event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    // Function to filter the list of restaurants based on the search bar and filters
    function filterRestaurants() {
        const searchText = searchBar.value.toLowerCase();
        const activeFilters = Array.from(filters).filter(filter => filter.checked).reduce((acc, filter) => {
            if (!acc[filter.name]) {
                acc[filter.name] = [];
            }
            acc[filter.name].push(filter.value);
            return acc;
        }, {});

        const filteredRestaurants = restaurants.filter(restaurant => {
            const matchesSearch = restaurant.name.toLowerCase().includes(searchText) ||
                restaurant.cuisine.toLowerCase().includes(searchText) ||
                (searchText === 'open now' && isOpen(restaurant.opening)) ||
                (searchText === 'near me' && restaurant.distance === '1km');
            
            const matchesFilters = Object.keys(activeFilters).every(filter => activeFilters[filter].includes(restaurant[filter]));
            
            return matchesSearch && matchesFilters;
        });

        displayRestaurants(filteredRestaurants);
    }

    // Function to clear all filters
    function clearFilters() {
        filters.forEach(filter => {
            filter.checked = false;
        });
        searchBar.value = '';
        displayRestaurants(restaurants);
    }

    // Function to all restaurants on the filter list to the wheel list
    function addAllRestaurants() {
        const searchText = searchBar.value.toLowerCase();
        const activeFilters = Array.from(filters).filter(filter => filter.checked).reduce((acc, filter) => {
            if (!acc[filter.name]) {
                acc[filter.name] = [];
            }
            acc[filter.name].push(filter.value);
            return acc;
        }, {});

        const filteredRestaurants = restaurants.filter(restaurant => {
            const matchesSearch = restaurant.name.toLowerCase().includes(searchText) ||
                restaurant.cuisine.toLowerCase().includes(searchText) ||
                (searchText === 'open now' && isOpen(restaurant.opening)) ||
                (searchText === 'near me' && restaurant.distance === '1km');
            
            const matchesFilters = Object.keys(activeFilters).every(filter => activeFilters[filter].includes(restaurant[filter]));
            
            return matchesSearch && matchesFilters;
        });

        filteredRestaurants.forEach(restaurant => {
            const listFrame = parent.document.getElementById('listFrame').contentWindow;
            listFrame.postMessage({ type: 'addRestaurant', restaurant: restaurant }, '*');
        });
    }

    searchBar.addEventListener('input', filterRestaurants);
    filters.forEach(filter => filter.addEventListener('change', filterRestaurants));
    clearFiltersButton.addEventListener('click', clearFilters);
    addAllButtonRestaurants.addEventListener('click', addAllRestaurants);

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.type === 'removeRestaurant') {
            const checkboxId = `checkbox-${event.data.restaurant.id}`;
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    });

    displayRestaurants(restaurants);
});

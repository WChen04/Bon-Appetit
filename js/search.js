document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const restaurantList = document.getElementById('restaurantList');
    const filters = document.querySelectorAll('.filters input[type="checkbox"]');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    const addAllButtonRestaurants = document.getElementById('addAllButtonRestaurants');

    // This will be replaced with a call to the backend to get the list of restaurants
    const restaurants = [
        // Array of restaurants with the following properties: name, distance, cuisine, rating, price, opening
        { name: 'Restaurant 1', distance: '1km', cuisine: 'Italian', rating: '5', price: '$$', opening: 'Morning'},
        { name: 'Restaurant 2', distance: '5km', cuisine: 'Chinese', rating: '4', price: '$', opening: 'Evening'},
        { name: 'Restaurant 3', distance: '10km', cuisine: 'Indian', rating: '2', price: '$$$', opening: 'Afternoon'},
        { name: 'Restaurant 4', distance: '1km', cuisine: 'Italian', rating: '5', price: '$$$$', opening: 'Morning'},
        { name: 'Restaurant 5', distance: '5km', cuisine: 'Chinese', rating: '4', price: '$', opening: 'Evening'},
        { name: 'Restaurant 6', distance: '1km', cuisine: 'Chinese', rating: '3', price: '$$', opening: 'Afternoon'},
        { name: 'Restaurant 7', distance: '5km', cuisine: 'Italian', rating: '5', price: '$$', opening: 'Evening'},
        { name: 'Restaurant 8', distance: '5km', cuisine: 'Chinese', rating: '4', price: '$', opening: 'Afternoon'},
        { name: 'Restaurant 9', distance: '10km', cuisine: 'Indian', rating: '5', price: '$$$$', opening: 'Afternoon'},
        { name: 'Restaurant 10', distance: '10km', cuisine: 'Indian', rating: '5', price: '$$', opening: 'Morning'},
        { name: 'Restaurant 11', distance: '20km', cuisine: 'Italian', rating: '1', price: '$$$', opening: 'Evening'},
        { name: 'Restaurant 12', distance: '5km', cuisine: 'Chinese', rating: '4', price: '$', opening: 'Afternoon'},
        { name: 'Restaurant 13', distance: '10km', cuisine: 'Italian', rating: '3', price: '$$$', opening: 'Afternoon'},
        // Add more restaurants here
    ];

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
            checkbox.id = `checkbox-${restaurant.name.replace(/\s+/g, '-')}`;
            checkbox.addEventListener('change', () => {
                const listFrame = parent.document.getElementById('listFrame').contentWindow;
                if (checkbox.checked) {
                    listFrame.postMessage({ type: 'addRestaurant', name: restaurant.name }, '*');
                } else {
                    listFrame.postMessage({ type: 'removeRestaurant', name: restaurant.name }, '*');
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
            listFrame.postMessage({ type: 'addRestaurant', name: restaurant.name }, '*');
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
            const checkboxId = `checkbox-${event.data.name.replace(/\s+/g, '-')}`;
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    });

    displayRestaurants(restaurants);
});
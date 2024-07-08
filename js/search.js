document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const restaurantList = document.getElementById('restaurantList');
    const filters = document.querySelectorAll('.filters input[type="checkbox"]');

    const restaurants = [
        { name: 'Restaurant 1', distance: '1km', cuisine: 'Italian', rating: '5', price: '$$', opening: 'Morning', delivery: 'Yes' },
        { name: 'Restaurant 2', distance: '5km', cuisine: 'Chinese', rating: '4', price: '$', opening: 'Evening', delivery: 'No' },
        { name: 'Restaurant 3', distance: '10km', cuisine: 'Indian', rating: '3', price: '$$$', opening: 'Afternoon', delivery: 'Yes' },
    ];

    function displayRestaurants(filteredRestaurants) {
        restaurantList.innerHTML = '';
        filteredRestaurants.forEach(restaurant => {
            const restaurantItem = document.createElement('div');
            restaurantItem.className = 'restaurant-item';
            restaurantItem.textContent = restaurant.name;
            restaurantList.appendChild(restaurantItem);
        });
    }

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
            const matchesSearch = restaurant.name.toLowerCase().includes(searchText);
            const matchesFilters = Object.keys(activeFilters).every(filter => activeFilters[filter].includes(restaurant[filter]));
            return matchesSearch && matchesFilters;
        });

        displayRestaurants(filteredRestaurants);
    }

    searchBar.addEventListener('input', filterRestaurants);
    filters.forEach(filter => filter.addEventListener('change', filterRestaurants));

    // Initial display
    displayRestaurants(restaurants);
});

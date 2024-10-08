document.addEventListener('DOMContentLoaded', () => {
    const selectedRestaurantsContainer = document.getElementById('selectedRestaurants');

    function addRestaurantToList(restaurantName) {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.textContent = restaurantName;
        selectedRestaurantsContainer.appendChild(restaurantItem);
    }

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.type === 'addRestaurant') {
            addRestaurantToList(event.data.name);
        }
    });
});

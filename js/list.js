document.addEventListener('DOMContentLoaded', () => {
    const selectedRestaurantsContainer = document.getElementById('selectedRestaurants');

    function addRestaurantToList(restaurantName) {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.textContent = restaurantName;
        selectedRestaurantsContainer.appendChild(restaurantItem);
        sendSelectedRestaurants();
    }

    function sendSelectedRestaurants() {
        const restaurantNames = Array.from(selectedRestaurantsContainer.children).map(item => item.textContent);
        console.log('Sending updateWheel message:', restaurantNames); // Debug log
        parent.postMessage({ type: 'updateWheel', restaurants: restaurantNames }, '*');
    }

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.type === 'addRestaurant') {
            addRestaurantToList(event.data.name);
        }
    });

    // Initial update to create an empty wheel with a default segment
    sendSelectedRestaurants();
});

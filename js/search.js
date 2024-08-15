document.addEventListener('DOMContentLoaded', async () => {
    const searchBar = document.getElementById('searchBar');
    const restaurantList = document.getElementById('restaurantList');
    const filters = document.querySelectorAll('.filters input[type="checkbox"]');
    const clearFiltersButton = document.getElementById('clearFiltersButton');
    const addAllButtonRestaurants = document.getElementById('addAllButtonRestaurants');

    // Conversion factor from meters to miles
    const metersToMiles = meters => meters * 0.000621371;

    // Process restaurant data from multiple JSON files
    async function getRestaurants() {
        const files = [
            "../db_files/troyQuery1.json", 
            "../db_files/troyQuery2.json",
            "../db_files/query=$$$$.json",
            "../db_files/twenty_restaurants.json",
            "../db_files/closest.json",
            "../db_files/chinese&indian.json",
        ];
        
        const restaurants = [];

        for (const file of files) {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                const data = await response.json();
                restaurants.push(...data.businesses);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        }

        // Filter out duplicate restaurants by name and phone number
        const uniqueRestaurants = restaurants.reduce((acc, restaurant) => {
            const existingRestaurant = acc.find(r => 
                r.name.toLowerCase() === restaurant.name.toLowerCase() && 
                r.phone === restaurant.phone
            );
            if (!existingRestaurant) {
                acc.push(restaurant);
            }
            return acc;
        }, []);

        return uniqueRestaurants;
    }

    let restaurants = await getRestaurants();

    // If no restaurants are fetched, use fallback data
    if (!restaurants || restaurants.length === 0) {
        restaurants = [
            { id: "1", name: "Fallback Restaurant", distance: "515", cuisine: "Fallback Cuisine", rating: 4.0, price: "$$", opening: "Afternoon", phone: "N/A" }
        ];
    }

    // Function to format phone numbers
    function formatPhoneNumber(phoneNumber) {
        if (!phoneNumber) return "N/A";
        
        // Remove +1 if it exists
        phoneNumber = phoneNumber.replace(/^\+1/, '');

        // Format the number as (123) 456-7890
        const match = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }

        return phoneNumber; // Return the original if it doesn't match the format
    }

    // Function to convert time to AM/PM format
    function convertToAmPm(timeStr) {
        let hour = parseInt(timeStr.slice(0, 2));
        const minutes = timeStr.slice(2);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // Convert '0' hour to '12'
        return `${hour}:${minutes} ${ampm}`;
    }

    // Function to check if the restaurant is open now
    function isOpenNow(openingTimes) {
        const currentDay = new Date().getDay();
        const currentTime = new Date().getHours() * 100 + new Date().getMinutes();
        const todaysHours = openingTimes.find(time => time.day === currentDay);

        if (!todaysHours) return false;

        const openingTime = parseInt(todaysHours.start);
        const closingTime = parseInt(todaysHours.end);

        // Check if the current time is within the opening hours
        return currentTime >= openingTime && currentTime <= closingTime;
    }

    // Function to get today's opening hours in AM/PM format
    function getTodaysHours(openingTimes) {
        const currentDay = new Date().getDay();
        const todaysHours = openingTimes.find(time => time.day === currentDay);
        if (!todaysHours) return "Hours not available";
        return `${convertToAmPm(todaysHours.start)} - ${convertToAmPm(todaysHours.end)}`;
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
    
        // Sort restaurants alphabetically by name (A-Z)
        filteredRestaurants.sort((a, b) => a.name.localeCompare(b.name));
    
        filteredRestaurants.forEach(restaurant => {
            const restaurantItem = document.createElement('div');
            restaurantItem.className = 'restaurant-item';
    
            const restaurantName = document.createElement('div');
            restaurantName.textContent = restaurant.name;
            restaurantName.className = 'restaurant-name';
    
            // Create a flex container for info and image
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'details-container'; // Add this class for styling
    
            const info = document.createElement('div');
            info.className = 'info';
            const isOpen = restaurant.business_hours && restaurant.business_hours.length > 0 ? isOpenNow(restaurant.business_hours[0].open) : false;
            const openStatus = isOpen ? '<span style="color:  rgb(61, 232, 132);;">Open</span>' : '<span style="color: red;">Closed</span>';
            
            // Join the address lines into a single string, separated by commas
            const address = restaurant.location.display_address.join(', ');
    
            // Calculate the distance in miles
            const distance = metersToMiles(restaurant.distance).toFixed(2) + ' miles';
    
            info.innerHTML = `
                <p>${openStatus}  |  ${formatPhoneNumber(restaurant.phone)}</p>
                <p>${restaurant.rating}★ (${restaurant.review_count} reviews) ${restaurant.price ? ` • ${restaurant.price}` : ''}</p>
                <p>${restaurant.categories.map(c => c.title).join(', ')}</p>
                <p>${address} | ${distance}</p> <!-- Display the address and distance here -->
                <p>Today's Hours: ${restaurant.business_hours && restaurant.business_hours.length > 0 ? getTodaysHours(restaurant.business_hours[0].open) : 'Hours not available'}</p>
                <a href="${restaurant.url}" target="_blank">Open on Yelp</a>
            `;
    
            const imgContainer = document.createElement('div');
            imgContainer.className = 'img-container';
            const img = document.createElement('img');
            img.src = restaurant.image_url || '/imgs/food_stock_image.jpg';
            img.alt = 'Restaurant Image';
            imgContainer.appendChild(img);
    
            // Add info and imgContainer to the detailsContainer
            detailsContainer.appendChild(info);
            detailsContainer.appendChild(imgContainer);
    
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
    
            restaurantItem.appendChild(restaurantName);
            restaurantItem.appendChild(detailsContainer); // Add the detailsContainer here
            restaurantItem.appendChild(checkboxContainer);
            restaurantList.appendChild(restaurantItem);
    
            restaurantItem.addEventListener('click', (event) => {
                if (event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }    

    function filterRestaurants() {
        const searchText = searchBar.value.toLowerCase();
        const activeFilters = Array.from(filters).filter(filter => filter.checked).reduce((acc, filter) => {
            if (!acc[filter.name]) {
                acc[filter.name] = [];
            }
            acc[filter.name].push(filter.value.toLowerCase());
            return acc;
        }, {});
        
        const filteredRestaurants = restaurants.filter(restaurant => {
            const restaurantDistance = metersToMiles(restaurant.distance);
    
            const matchesSearch = restaurant.name.toLowerCase().includes(searchText) ||
                restaurant.categories.some(category => category.title.toLowerCase().includes(searchText)) ||
                (searchText === 'open now' && restaurant.business_hours && restaurant.business_hours.length > 0 && isOpenNow(restaurant.business_hours[0].open)) ||
                (searchText === 'near me' && restaurantDistance <= 1);
    
            const matchesFilters = Object.keys(activeFilters).every(filter => {
                if (filter === 'distance') {
                    return activeFilters[filter].some(value => {
                        if (value === "< 1") return restaurantDistance < 1;
                        if (value === "1-5") return restaurantDistance >= 1 && restaurantDistance <= 5;
                        if (value === "5-10") return restaurantDistance > 5 && restaurantDistance <= 10;
                        if (value === "> 10") return restaurantDistance > 10;
                    });
                }
                if (filter === 'cuisine') {
                    return restaurant.categories.some(category => {
                        const categoryTitle = category.title.toLowerCase();
                        return activeFilters[filter].some(value => {
                            if (value === 'bars') {
                                return (categoryTitle.includes('bars') || categoryTitle.includes('bar')) && 
                                       !categoryTitle.includes('barbeque') && !categoryTitle.includes('sushi');
                            } else if (value === 'american') {
                                return categoryTitle === 'american';
                            } else if (value === 'latin american') {
                                return categoryTitle === 'latin american';
                            }
                            return categoryTitle === value;
                        });
                    });
                }
                if (filter === 'rating') {
                    return activeFilters[filter].some(value => {
                        const rating = restaurant.rating;
                        if (value === "< 1") return rating < 1;
                        if (value === "1-2") return rating >= 1 && rating < 2;
                        if (value === "2-3") return rating >= 2 && rating < 3;
                        if (value === "3-4") return rating >= 3 && rating < 4;
                        if (value === "4-5") return rating >= 4 && rating <= 5;
                    });
                }
                if (filter === 'price') {
                    return activeFilters[filter].includes(restaurant.price?.toLowerCase());
                }
                return activeFilters[filter].includes(restaurant[filter]?.toLowerCase());
            });
    
            return matchesSearch && matchesFilters;
        });
    
        displayRestaurants(filteredRestaurants);
    }    

    function clearFilters() {
        filters.forEach(filter => filter.checked = false);
        searchBar.value = '';
        displayRestaurants(restaurants);
    }

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
                restaurant.categories.some(category => category.title.toLowerCase().includes(searchText)) ||
                (searchText === 'open now' && restaurant.business_hours && restaurant.business_hours.length > 0 && isOpenNow(restaurant.business_hours[0].open)) || 
                (searchText === 'near me' && restaurant.distance === '1km');

            const matchesFilters = Object.keys(activeFilters).every(filter => 
                activeFilters[filter].some(value => restaurant.categories.map(c => c.title).includes(value))
            );

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

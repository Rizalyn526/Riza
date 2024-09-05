document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'cc68bd4d6b26495ba2d60337241208';
    let cityName = 'Iligan';
    let unit = 'C';
    let weatherVisible = true;
    let currentLat = null;
    let currentLon = null;
    let currentCity = 'Iligan'; // Default city

    async function fetchWeather(city) {
        const apiEndpoint = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=10`;
        try {
            const response = await fetch(apiEndpoint);
            const weatherData = await response.json();
            const weatherContainer = document.querySelector('#weather-row');
            const alertContainer = document.getElementById('weatherAlerts');

            weatherContainer.innerHTML = '';
            alertContainer.innerHTML = '';

            if (weatherData.alerts && weatherData.alerts.alert.length > 0) {
                alertContainer.style.display = 'block';
                weatherData.alerts.alert.forEach(alert => {
                    const alertItem = document.createElement('div');
                    alertItem.textContent = `${alert.headline}: ${alert.desc}`;
                    alertContainer.appendChild(alertItem);
                });
            } else {
                alertContainer.style.display = 'none';
            }

            weatherData.forecast.forecastday.forEach(day => {
                const weatherDiv = document.createElement('div');
                weatherDiv.classList.add('weather-container');

                const date = new Date(day.date);
                const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
                const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

                let temperature = unit === 'C' ? `${day.day.avgtemp_c} °C` : `${day.day.avgtemp_f} °F`;

                weatherDiv.innerHTML = `
                    <div class="weather-info">
                        <h4>${dayOfWeek}, ${formattedDate}</h4>
                        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                        <p>Temperature: ${temperature}</p>
                        <p>${day.day.condition.text}</p>
                        <p>Location: ${currentCity} (${currentLat ? `${currentLat.toFixed(2)}, ${currentLon.toFixed(2)}` : 'Fetching location...'})</p>
                    </div>
                `;

                weatherDiv.addEventListener('click', function () {
                    weatherDiv.classList.toggle('expanded');
                });

                weatherContainer.appendChild(weatherDiv);
            });
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    function updateMap(lat, lon) {
        const weatherMap = document.getElementById('weather-map');
        const mapUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=5&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=${lat}&detailLon=${lon}&metricWind=default&metricTemp=default&radarRange=-1`;
        weatherMap.src = mapUrl;
    }

    function toggleWeatherVisibility() {
        const weatherContainer = document.getElementById('weather-row');
        weatherVisible = !weatherVisible;
        weatherContainer.style.display = weatherVisible ? 'flex' : 'none';
        document.getElementById('hideWeatherButton').textContent = weatherVisible ? 'Hide Weather' : 'Show Weather';
    }

    function openSearchModal() {
        document.getElementById('searchModal').style.display = 'block';
    }

    function closeSearchModal() {
        document.getElementById('searchModal').style.display = 'none';
    }

    function fetchCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                // Use reverse geocoding to get city name from coordinates
                fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${currentLat},${currentLon}`)
                    .then(response => response.json())
                    .then(data => {
                        currentCity = data[0]?.name || 'Unknown City';
                        cityName = `${currentLat},${currentLon}`;
                        fetchWeather(cityName);
                        updateMap(currentLat, currentLon);
                    });
            }, error => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    document.getElementById('searchButton').addEventListener('click', openSearchModal);
    document.querySelector('.modal .close').addEventListener('click', closeSearchModal);
    document.getElementById('submitSearchButton').addEventListener('click', function () {
        cityName = document.getElementById('cityInput').value;
        fetchWeather(cityName);
        closeSearchModal();
    });

    document.getElementById('currentLocationButton').addEventListener('click', fetchCurrentLocation);

    document.getElementById('celsiusButton').addEventListener('click', function () {
        unit = 'C';
        fetchWeather(cityName);
    });

    document.getElementById('fahrenheitButton').addEventListener('click', function () {
        unit = 'F';
        fetchWeather(cityName);
    });

    document.getElementById('hideWeatherButton').addEventListener('click', toggleWeatherVisibility);

    // Fetch weather for Iligan City on initial load
    fetchWeather(cityName);
});

document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("city-input");
    const getWeatherBtn = document.getElementById("get-weather-btn");
    const weatherInfo = document.getElementById("weather-info");
    const forecast = document.getElementById("forecast");
    const cityNameDisplay = document.getElementById("city-name");
    const temperatureDisplay = document.getElementById("temperature");
    const descriptionDisplay = document.getElementById("description");
    const windSpeedDisplay = document.getElementById("wind-speed-value");
    const errorMessage = document.getElementById("error-message");
    const weatherIcon = document.querySelector('#weather-icon i');
    const forecastContainer = document.getElementById("forecast-container");

    const API_KEY = "28463d613bbde5bcffe8571be9aaa852"; // env variables

    getWeatherBtn.addEventListener("click", handleWeatherRequest);

    function handleWeatherRequest() {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        } else {
            resetToDefault();
        }
    }

    function resetToDefault() {
        weatherInfo.classList.add('hidden');
        forecast.classList.add('hidden');
        errorMessage.classList.add('hidden');
        cityInput.value = "";
        cityNameDisplay.textContent = "";
        temperatureDisplay.textContent = "";
        descriptionDisplay.textContent = "";
        windSpeedDisplay.textContent = "";
        weatherIcon.className = "wi wi-day-sunny";
        forecastContainer.innerHTML = "";
    }

    const weatherElements = [cityNameDisplay, temperatureDisplay, descriptionDisplay, windSpeedDisplay, weatherIcon];

    async function fetchWeatherData(city) {
        try {
            // Fade out current weather info
            fadeOutWeatherInfo();

            const weatherData = await fetchData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
            const forecastData = await fetchData(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);

            // Short delay to ensure fade out is complete
            setTimeout(() => {
                displayWeatherData(weatherData);
                displayForecastData(forecastData);
                fadeInWeatherInfo();
            }, 300);
        } catch (error) {
            showError();
        }
    }

    function fadeOutWeatherInfo() {
        weatherInfo.classList.add('fade-out');
        forecast.classList.add('fade-out');
        weatherElements.forEach(el => el.classList.add('fade-out'));
    }

    function fadeInWeatherInfo() {
        weatherInfo.classList.remove('hidden', 'fade-out');
        forecast.classList.remove('hidden', 'fade-out');
        weatherElements.forEach(el => el.classList.remove('fade-out'));
        
        // Trigger reflow to ensure the fade-in animation plays
        void weatherInfo.offsetWidth;
        
        weatherInfo.classList.add('fade-in');
        forecast.classList.add('fade-in');
        weatherElements.forEach(el => el.classList.add('fade-in'));
    }

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Data not found');
        }
        return await response.json();
    }

    function displayWeatherData(weatherData) {
        errorMessage.classList.add('hidden');
        cityNameDisplay.textContent = weatherData.name;
        temperatureDisplay.textContent = `${Math.round(weatherData.main.temp)}°C`;
        descriptionDisplay.textContent = weatherData.weather[0].description;
        windSpeedDisplay.textContent = `${weatherData.wind.speed} m/s`;
        updateWeatherIcon(weatherData.weather[0].icon);
    }

    function displayForecastData(forecastData) {
        forecastContainer.innerHTML = '';
        const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0);
        
        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(forecast.main.temp);
            const iconCode = forecast.weather[0].icon;
            const iconClass = getWeatherIconClass(iconCode);

            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <p>${dayName}</p>
                <i class="wi ${iconClass}"></i>
                <p>${temp}°C</p>
            `;
            forecastContainer.appendChild(forecastItem);
        });
    }

    function showError() {
        fadeOutWeatherInfo();
        setTimeout(() => {
            weatherInfo.classList.add('hidden');
            forecast.classList.add('hidden');
            errorMessage.classList.remove('hidden');
            errorMessage.classList.add('fade-in');
        }, 300);
    }

    function updateWeatherIcon(iconCode) {
        const iconClass = getWeatherIconClass(iconCode);
        weatherIcon.className = `wi ${iconClass}`;
    }

    function getWeatherIconClass(iconCode) {
        const iconMap = {
            '01d': 'wi-day-sunny',
            '01n': 'wi-night-clear',
            '02d': 'wi-day-cloudy',
            '02n': 'wi-night-alt-cloudy',
            '03d': 'wi-cloud',
            '03n': 'wi-cloud',
            '04d': 'wi-cloudy',
            '04n': 'wi-cloudy',
            '09d': 'wi-showers',
            '09n': 'wi-showers',
            '10d': 'wi-day-rain',
            '10n': 'wi-night-alt-rain',
            '11d': 'wi-thunderstorm',
            '11n': 'wi-thunderstorm',
            '13d': 'wi-snow',
            '13n': 'wi-snow',
            '50d': 'wi-fog',
            '50n': 'wi-fog'
        };

        return iconMap[iconCode] || 'wi-day-sunny';
    }
});
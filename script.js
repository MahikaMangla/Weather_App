const apiKey = "3d6f270041118f45911d25f153616614"; 
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const weatherIcon = document.getElementById('weather-icon');
const loader = document.getElementById('loader');
const city = document.querySelector('.city');
const temperature = document.querySelector('.temperature');
const feelsLike = document.querySelector('.feels-like');
const description = document.querySelector('.description');
const humidity = document.querySelector('.humidity-value');
const wind = document.querySelector('.wind-value');
const aqiValue = document.querySelector('.aqi-value');
const sunriseValue = document.querySelector('.sunrise-value');
const sunsetValue = document.querySelector('.sunset-value');
const updateTime = document.querySelector('.update-time');
const forecast = document.getElementById('forecast');
const celsiusBtn = document.getElementById('celsius');
const fahrenheitBtn = document.getElementById('fahrenheit');

let currentUnit = 'celsius';

const weatherIconMap = {
    '01d': 'clear-day.png',
    '01n': 'clear-night.png',
    '02d': 'partly-cloudy-day.png',
    '02n': 'partly-cloudy-night.png',
    '03d': 'cloudy.png',
    '03n': 'cloudy.png',
    '04d': 'cloudy.png',
    '04n': 'cloudy.png',
    '09d': 'rain.png',
    '09n': 'rain.png',
    '10d': 'rain.png',
    '10n': 'rain.png',
    '11d': 'thunderstorm.png',
    '11n': 'thunderstorm.png',
    '13d': 'snow.png',
    '13n': 'snow.png',
    '50d': 'mist.png',
    '50n': 'mist.png'
};

function showLoader() {
    loader.style.display = 'flex';
}

function hideLoader() {
    loader.style.display = 'none';
}

function convertToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        const data = await response.json();
        return data.list[0].main.aqi;
    } catch (error) {
        console.error('Error fetching air quality:', error);
        return null;
    }
}

function getAQIDescription(aqi) {
    const aqiMap = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor'
    };
    return aqiMap[aqi] || 'Unknown';
}

async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return null;
    }
}

function updateForecast(forecastData) {
    forecast.innerHTML = '';
    const dailyData = forecastData.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    dailyData.forEach(day => {
        const temp = currentUnit === 'celsius' ? 
            Math.round(day.main.temp) : 
            Math.round(convertToFahrenheit(day.main.temp));
        
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${date}</div>
            <img src="./images/${weatherIconMap[day.weather[0].icon]}" alt="weather icon" class="forecast-icon">
            <div class="forecast-temp">${temp}°${currentUnit === 'celsius' ? 'C' : 'F'}</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
        `;
        forecast.appendChild(forecastItem);
    });
}

async function getWeather(cityName) {
    try {
        showLoader();
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        // Get air quality data
        const aqi = await getAirQuality(data.coord.lat, data.coord.lon);
        
        // Get forecast data
        const forecastData = await getForecast(cityName);
        
        updateWeatherUI(data, aqi);
        if (forecastData) {
            updateForecast(forecastData);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        hideLoader();
    }
}

function updateWeatherUI(data, aqi) {
    const temp = currentUnit === 'celsius' ? 
        Math.round(data.main.temp) : 
        Math.round(convertToFahrenheit(data.main.temp));
    
    const feelsLikeTemp = currentUnit === 'celsius' ? 
        Math.round(data.main.feels_like) : 
        Math.round(convertToFahrenheit(data.main.feels_like));

    city.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${temp}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
    feelsLike.textContent = `Feels like: ${feelsLikeTemp}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} km/h`;
    
    if (aqi) {
        aqiValue.textContent = getAQIDescription(aqi);
    }
    
    sunriseValue.textContent = formatTime(data.sys.sunrise);
    sunsetValue.textContent = formatTime(data.sys.sunset);
    updateTime.textContent = new Date().toLocaleTimeString();
    
    const iconCode = data.weather[0].icon;
    const iconPath = `./images/${weatherIconMap[iconCode]}`;
    weatherIcon.src = iconPath;
}

searchButton.addEventListener('click', () => {
    const cityName = searchInput.value.trim();
    if (cityName) {
        getWeather(cityName);
    }
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const cityName = searchInput.value.trim();
        if (cityName) {
            getWeather(cityName);
        }
    }
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'celsius') {
        currentUnit = 'celsius';
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        const cityName = searchInput.value.trim() || 'London';
        getWeather(cityName);
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'fahrenheit') {
        currentUnit = 'fahrenheit';
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        const cityName = searchInput.value.trim() || 'London';
        getWeather(cityName);
    }
});

// Load default city weather
window.addEventListener('load', () => {
    getWeather('London');
});

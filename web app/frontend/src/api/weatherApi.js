/**
 * Fetches current weather data.
 * @returns {Promise<Object>} - Promise resolving to the current weather data.
 */
export async function fetchCurrentWeather() {
    try {
      const url = new URL("https://reetuinkila.eu.pythonanywhere.com/saa");
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
  
    } catch (error) {
      console.error("Failed to fetch current weather data:", error);
      throw error; // Propagate the error up for further handling
    }
}
  
/**
* Fetches historical weather data based on the selected period.
* @param {string} period - Selected duration (day, week, month).
* @returns {Promise<Object[]>} - Promise resolving to the historical weather data.
*/
export async function fetchWeatherHistory(period) {
    try {
      const url = new URL(`https://reetuinkila.eu.pythonanywhere.com/historia?period=${period}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
  
    } catch (error) {
      console.error("Failed to fetch historical weather data:", error);
      throw error; // Propagate the error up for further handling
    }
}
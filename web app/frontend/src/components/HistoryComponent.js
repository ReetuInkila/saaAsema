import React from "react";
import ChartComponent from "./ChartComponent";
import { fetchWeatherHistory } from '../api/weatherApi'; // Import the API functions

/**
* React functional component for displaying historical charts.
* @param {Object} props - Component props.
* @param {string} props.select - Selected duration (day, week, month).
* @returns {JSX.Element} The historical charts component.
*/
const HistoryComponent = function ({ select }) {
    // State to store historical data for temperature, humidity, pressure, and labels
    const [temp, setTemp] = React.useState([]);
    const [humidity, setHumidity] = React.useState([]);
    const [pressure, setPressure] = React.useState([]);
    const [labels, setLabels] = React.useState([]);
  
    /**
     * useEffect to fetch historical data when the selected duration changes.
     */
    React.useEffect(() => {
        console.log(select);
        fetchWeatherHistory(select)
            .then((data) => {
                const temperatureValues = data.map((entry) => entry.lampo);
                setTemp(temperatureValues);
  
                const pressureValues = data.map((entry) => entry.paine);
                setPressure(pressureValues);
  
                const humidityValues = data.map((entry) => entry.kosteus);
                setHumidity(humidityValues);
  
                const labels = data.map((entry) => entry.aika);
                setLabels(labels);
            });
    }, [select]);
  
    return (
        <div className="child">
            {/* Display historical charts */}
            <ChartComponent data={temp} labels={labels} name={'Temperature'} />
            <ChartComponent data={pressure} labels={labels} name={'Pressure'} />
            <ChartComponent data={humidity} labels={labels} name={'Humidity'} />
        </div>
    );
};

export default HistoryComponent;
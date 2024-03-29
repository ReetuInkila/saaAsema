/**
 * React functional component for the weather application.
 * @returns {JSX.Element} The root component.
 */
const App = () => {
    // State to store the latest weather data and selected duration
    const [last, setLast] = React.useState({
        aika: "",
        kosteus: 0,
        lampo: 0,
        paine: 0
    });
    const [select, setSelect] = React.useState("week");

    /**
     * useEffect to fetch weather data when the page is opened.
     */
    React.useEffect(() => {
        hae_saa()
            .then((data) => {
                console.log(data);
                setLast({ aika: data.aika, kosteus: data.kosteus, lampo: data.lampo, paine: data.paine });
            });
    }, []);

    return (
        <div>
            {/* Weather display and selector */}
            <div className="child">
                <SaaPlotter saaData={last} />
                <LengthSelector setSelect={setSelect} />
            </div>
            {/* Historical charts */}
            <HistoryComponent select={select} />
        </div>
    );
};

/**
 * React functional component for displaying current weather information.
 * @param {Object} props - Component props.
 * @param {Object} props.saaData - Object containing weather data.
 * @returns {JSX.Element} The weather display component.
 */
const SaaPlotter = function (props) {
    // State to store formatted date and animate humidity bar
    const [aika, setAika] = React.useState("");
    const [kosteus, setKosteus] = React.useState(0);
    const intervalRef = React.useRef();

    /**
     * useEffect to format date when a new date is received.
     */
    React.useEffect(() => {
        let utcDate = new Date(props.saaData.aika);
        let userTimezoneOffset = new Date().getTimezoneOffset();
        let userDatetime = new Date(utcDate.getTime() - (userTimezoneOffset * 60000));
        setAika(userDatetime.toLocaleString());
    }, [props.saaData.aika]);

    /**
     * useEffect to animate humidity bar when a new humidity value is received.
     */
    React.useEffect(() => {
        const move = () => {
            let i = 0;
            intervalRef.current = setInterval(() => {
                if (i >= props.saaData.kosteus) {
                    clearInterval(intervalRef.current);
                } else {
                    setKosteus(i);
                }
                i++;
            }, 20);
        };
        move();
    }, [props.saaData.kosteus]);

    return (
        <div>
            <h1>{aika}</h1>
            <p>{props.saaData.lampo} &deg;C</p>
            <p>{props.saaData.paine} Pa</p>
            <PrecentageBar precentage={kosteus} />
        </div>
    );
};

/**
 * React functional component for displaying a percentage bar.
 * @param {Object} props - Component props.
 * @param {number} props.precentage - Percentage value.
 * @returns {JSX.Element} The percentage bar component.
 */
const PrecentageBar = function (props) {
    return (
        <div className="background">
            <div
                className="progress"
                style={{ width: `${props.precentage}%` }}
            >
                <img className="logo" src="static/humidity.svg" alt="humidity" />
                {props.precentage}%
            </div>
        </div>
    );
};

/**
 * React functional component for selecting the duration (day, week, month).
 * @param {Object} props - Component props.
 * @param {function} props.setSelect - Function to update the selected duration in the parent component.
 * @returns {JSX.Element} The duration selector component.
 */
const LengthSelector = function ({ setSelect }) {
    /**
     * Handles the change in duration selection.
     * @param {Object} event - Change event.
     */
    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setSelect(selectedValue); // Update the selected value in the parent component
    };

    return (
        <select onChange={handleSelectChange} defaultValue="week">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
        </select>
    );
};

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
        hae_historia(select)
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

/**
 * React functional component for displaying a line chart.
 * @param {Object} props - Component props.
 * @param {number[]} props.data - Array of data points.
 * @param {string[]} props.labels - Array of labels corresponding to data points.
 * @param {string} props.name - Name of the chart.
 * @returns {JSX.Element} The chart component.
 */
const ChartComponent = function ({ data, labels, name }) {
    // Ref for the chart canvas and chart instance
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    /**
     * useEffect to create or update the chart when data changes.
     */
    React.useEffect(() => {
        const ctx = document.getElementById(`${name}Chart`).getContext('2d');
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Find the maximum and minimum values
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: name,
                        data: data,
                        borderColor: 'rgba(255, 0, 0, 1)',
                        borderWidth: 1,
                        fill: false,
                    },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 7, // Set the maximum number of ticks to be displayed
                            maxRotation: 0, // Set the maximum rotation angle
                            minRotation: 0, // Set the minimum rotation angle
                        },
                    },
                    y: {
                        min: minValue,
                        max: maxValue,
                        beginAtZero: false,
                    },
                },
            }
        });
    }, [data, labels]);

    return (
        <canvas id={`${name}Chart`} width="100%" height="30%"></canvas>
    );
};

// Base URL for API requests
let baseUrl = window.location.href;

/**
 * Async function to fetch current weather data.
 * @returns {Promise<Object>} Promise that resolves to the current weather data.
 */
async function hae_saa() {
    let url = new URL(baseUrl + "saa");
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response;
    return (data.json());
}

/**
 * Async function to fetch historical weather data.
 * @param {string} duration - Selected duration (day, week, month).
 * @returns {Promise<Object[]>} Promise that resolves to an array of historical weather data.
 */
async function hae_historia(duration) {
    let url = new URL(`${baseUrl}/historia?period=${duration}`);
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response;
    return (data.json());
}

// Render the root component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

const App = () => {
    const [last, setLast] = React.useState({
        aika:"",
        kosteus: 0,
        lampo: 0,
        paine:0
    });
    const [select, setSelect] = React.useState("week");


    // Kun sivu avataan haetaan treenin data
    React.useEffect(() => {
        hae_saa()
        .then((data) => {
            console.log(data);
            setLast({aika:data.aika, kosteus:data.kosteus, lampo:data.lampo, paine:data.paine});
        });

    }, []);

    return (
        <div>
            <SaaPlotter
                saaData={last}
            />
            <HistoryComponent
                select={select}
            />
        </div>
        
    );
};

const SaaPlotter = function(props) {
    const [aika, setAika] = React.useState("");
    const [kosteus, setKosteus] = React.useState(0);
    const intervalRef = React.useRef();

    React.useEffect(() => {
        let utcDate = new Date(props.saaData.aika);
        let userTimezoneOffset = new Date().getTimezoneOffset();
        let userDatetime = new Date(utcDate.getTime() - (userTimezoneOffset * 60000));
        setAika(userDatetime.toLocaleString());
    }, [props.saaData.aika]);

    React.useEffect(() => {
        const move = () => {
            let i = 0;
            intervalRef.current = setInterval(() => {
              if (i >= props.saaData.kosteus) {
                clearInterval(intervalRef.current);
              } else {
                setKosteus(i);
              }
              i ++;
            }, 20);
        };
        move();

    }, [props.saaData.kosteus]);

    return (
        <div>
            <h1>{aika}</h1>
            <p>{props.saaData.lampo} &deg;C</p>
            <p>{props.saaData.paine} Pa</p>  
            <PrecentageBar
                precentage={kosteus}
            />
        </div>
    );
};

const PrecentageBar = function(props) {
    return (
        <div className="background">
            <div
                className="progress"
                 style={{ width: `${props.precentage}%` }}
            >
                <img className="logo" src="static/humidity.svg"/>
                {props.precentage}%
            </div>
        </div>
    );
};

const HistoryComponent = function ({ select }) {
    const [temp, setTemp] = React.useState([]);
    const [humidity, setHumidity] = React.useState([]);
    const [pressure, setPressure] = React.useState([]);
    const [labels, setLabels] = React.useState([]);

    React.useEffect(() => {
        console.log(select);
        hae_historia(select)
        .then((data) => {
            const temperatureValues = data.map((entry) => entry.lampo);
            setTemp(temperatureValues);

            const pressureValues =  data.map((entry) => entry.paine);
            setPressure(pressureValues);

            const humidityValues = data.map((entry) => entry.kosteus);
            setHumidity(humidityValues);

            const labels= data.map((entry) => entry.aika);
            setLabels(labels);
        });        
    }, [select]);

    return (
        <div>
            <ChartComponent data={temp} labels={labels} name={'Temperature'}/>
            <ChartComponent data={humidity} labels={labels} name={'Humidity'}/>
            <ChartComponent data={pressure} labels={labels} name={'Pressure'}/>
        </div>
            
    );
};

const ChartComponent = function ({ data, labels, name }) {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
            const ctx = document.getElementById(`${name}Chart`).getContext('2d');
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Find the maximum and minimum temperature values
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
    }, [data]);

    return (
        <canvas id={`${name}Chart`} width="100vw" height="50vw"></canvas>    
    );
};

let baseUrl = window.location.href;

async function hae_saa(){
    let url = new URL(baseUrl+"saa");
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response;
    return(data.json());
}

async function hae_historia(duration){
    let url = new URL(`${baseUrl}/historia?period=${duration}`);
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response;
    return(data.json());
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
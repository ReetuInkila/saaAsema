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
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
        console.log(select);
        hae_historia(select)
        .then((data) => {
            console.log(data);
            const ctx = document.getElementById('historyChart').getContext('2d');
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            


            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map((entry) => entry.aika),
                    datasets: [
                        {
                          label: 'Temperature',
                          data: data.map((entry) => entry.lampo),
                          borderColor: 'rgba(255, 99, 132, 1)',
                          borderWidth: 1,
                          fill: false,
                        },
                    ],
                },
                options: {
                },
            });



        });            
    }, [select]);


    return (
            <canvas id="historyChart" width="100vw" height="400px"></canvas>
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
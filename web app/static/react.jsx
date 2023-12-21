const App = () => {
    const [last, setLast] = React.useState({
        aika:"",
        kosteus: 0,
        lampo: 0,
        paine:0
    });


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
        </div>
        
    );
};

const SaaPlotter = function(props) {
    const [aika, setAika] = React.useState("");

    React.useEffect(() => {
        if(props.saaData.aika != ""){
            let utcDate = new Date(props.saaData.aika);
            let userTimezoneOffset = new Date().getTimezoneOffset();
            let userDatetime = new Date(utcDate.getTime() - (userTimezoneOffset * 60000));
            setAika(userDatetime.toLocaleString());
        }
    }, [props]);


    return (
        <div>
            <h1>{aika}</h1>
            <p>{props.saaData.lampo} &deg;C</p>
            <p>{props.saaData.kosteus} %</p>
            <p>{props.saaData.paine} Pa</p>  
        </div>
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
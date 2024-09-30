import React from "react";
import PrecentageBar from "./PrecentageBar";

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

export default SaaPlotter;
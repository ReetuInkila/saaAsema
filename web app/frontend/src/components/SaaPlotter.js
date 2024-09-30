import React from "react";
import PrecentageBar from "./PrecentageBar";

/**
 * React functional component for displaying current weather information.
 * @param {Object} props - Component props.
 * @param {Object} props.saaData - Object containing weather data.
 * @returns {JSX.Element} The weather display component.
 */
const SaaPlotter = function (props) {
    const [aika, setAika] = React.useState("");
    const [kosteus, setKosteus] = React.useState(0);
    const animationFrameRef = React.useRef(null);

    /**
     * useEffect to format date when a new date is received.
     */
    React.useEffect(() => {
        if (props.saaData.aika) {
            let utcDate = new Date(props.saaData.aika);
            let userTimezoneOffset = new Date().getTimezoneOffset();
            let userDatetime = new Date(utcDate.getTime() - (userTimezoneOffset * 60000));
            setAika(userDatetime.toLocaleString());
        }
    }, [props.saaData.aika]);

    /**
     * useEffect to animate the humidity bar when a new humidity value is received.
     * Creates a linear animation over 1 second.
     */
    React.useEffect(() => {
        let startValue = kosteus;
        let endValue = props.saaData.kosteus;
        let startTime = null;
        const duration = 1000; // Animation duration in milliseconds (1 second)

        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = time - startTime;
            const percentage = Math.min((progress / duration), 1); // Linear progress (0 to 1)
            const currentValue = startValue + (percentage * (endValue - startValue));

            setKosteus(currentValue);

            if (percentage < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        // Start the animation
        if (endValue !== startValue) {
            cancelAnimationFrame(animationFrameRef.current); // Cancel any previous animation
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        // Cleanup on component unmount
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [props.saaData.kosteus, kosteus]);

    return (
        <div>
            <h1>{aika}</h1>
            <p>{props.saaData.lampo} &deg;C</p>
            <p>{props.saaData.paine} Pa</p>
            <PrecentageBar precentage={Math.round(kosteus)} />
        </div>
    );
};

export default SaaPlotter;

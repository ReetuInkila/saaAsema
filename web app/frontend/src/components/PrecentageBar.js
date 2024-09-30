import React from "react";
import humidityIcon from "./humidity.svg"; // Import the SVG image

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
                <img className="logo" src={humidityIcon} alt="humidity" />
                {props.precentage}%
            </div>
        </div>
    );
};

export default PrecentageBar;

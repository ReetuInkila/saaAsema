import React from "react";
import Chart from "chart.js/auto";

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
    }, [data, labels, name]);
  
    return (
        <canvas id={`${name}Chart`} width="100%" height="30%"></canvas>
    );
};

export default ChartComponent;
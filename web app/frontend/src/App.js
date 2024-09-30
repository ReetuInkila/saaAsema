import React from 'react';
import SaaPlotter from './components/SaaPlotter';
import HistoryComponent from './components/HistoryComponent';
import LengthSelector from './components/LengthSelector';
import { fetchCurrentWeather } from './api/weatherApi';
import './App.css';

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
      fetchCurrentWeather()
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

export default App;
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
 export default LengthSelector;
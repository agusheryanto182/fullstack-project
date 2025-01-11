import { useState, useEffect } from "react";
import CustomAlert from "./custom-alert";
import { createEmployee, getDivisions } from "../api/api";

export default function AddEmployee({
  onAddEmployee,
  totalEmployees,
  onTotalEmployees,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    id: "",
    name: "",
    image: "",
    phone: "",
    division: "",
    position: "",
  });
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await getDivisions();
        console.log(response);
        setDivisions(response.data.data.divisions);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDivisions();
  }, []);

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async () => {
    if (
      !newEmployee.name ||
      !newEmployee.phone ||
      !newEmployee.division ||
      !newEmployee.position
    ) {
      setAlertMessage("Please fill in all required fields.");
      setShowPopup(false);
      return;
    }

    setAlertMessage("Data sucessfully added");
    setAlertType("success");

    try {
      const response = await createEmployee(newEmployee);
      console.log("create employee response: ", response);
    } catch (error) {
      console.error(error);
    }

    // onTotalEmployees(updatedEmployees.length);
    setShowPopup(false);
    onAddEmployee(newEmployeeData);
    setNewEmployee({
      id: "",
      name: "",
      image: "",
      phone: "",
      division: "",
      position: "",
    });
  };

  const closeAlert = () => {
    setAlertMessage(null);
    setAlertType("");
  };

  return (
    <div className="flex  items-center justify-between h-[100px] px-5 w-full bg-white text-black relative dark:bg-black dark:text-white">
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          type={alertType}
          onClose={closeAlert}
        />
      )}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-medium text-xl md:text-2xl">Employees</h1>
          <span className="text-sm bg-[var(--light-maroon)] text-[var(--maroon)] rounded-full py-1 px-2">
            {totalEmployees}
          </span>
        </div>
      </div>

      <div
        className="bg-[var(--maroon)] hover:bg-[var(--hover-maroon)] px-5 py-2 rounded-full flex cursor-pointer items-center gap-2"
        onClick={() => setShowPopup(true)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="10"
            stroke="#D0D5DD"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 3"
          />
          <path
            d="M12 7.33334V16.6667M7.33334 12H16.6667"
            stroke="#F5F6F7"
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="text-base font-semibold md:font-bold  text-white">
          Add New
        </h1>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex px-4  items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-5 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-3">Add New Employee</h2>
            <div className="mb-2">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={newEmployee.name}
                onChange={handleInputChange}
                className="w-full border p-2 rounded dark:text-black"
                required
              />
            </div>
            <div className="mb-2">
              <label>Image:</label>
              <input
                type="file"
                name="image"
                onChange={(e) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setNewEmployee((prev) => ({
                      ...prev,
                      image: reader.result,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
                className="w-full border p-2 rounded dark:text-black"
              />
            </div>
            <div className="mb-2">
              <label>Phone:</label>
              <input
                type="number"
                name="phone"
                value={newEmployee.phone}
                onChange={handleInputChange}
                className="w-full border p-2 rounded dark:text-black"
                required
              />
            </div>
            <div className="mb-2">
              <label>Division:</label>
              <select
                name="division"
                value={newEmployee.division}
                onChange={handleInputChange}
                className="w-full border p-2 rounded dark:text-black"
                required
              >
                <option value="" aria-required>
                  Select division
                </option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label>Position:</label>
              <input
                type="text"
                name="position"
                value={newEmployee.position}
                onChange={handleInputChange}
                className="w-full border p-2 rounded dark:text-black"
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-[var(--maroon)] text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import Navbar from "../components/navbar";
import AddEmployee from "../components/add-employee";
import Tab from "../components/tab";
import EmployeeTable from "../components/employee-table";
import { useState, useEffect } from "react";
import DivisionTable from "../components/division-table";
import { getEmployees } from "../api/api";

const dummyEmployees = [
  {
    id: 1,
    name: "Agus Heryanto",
    email: "agusheryantodev@gmail.com",
    image: "https://avatars.githubusercontent.com/u/112523637?v=4",
    phone: "081296380081",
    division: "Full Stack",
    position: "Intern",
    created_at: "2025-01-10T17:28:42.935Z",
  },
];

export default function Homepage() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "all";
  });

  const [employees, setEmployees] = useState([]);

  const [totalEmployees, setTotalEmployees] = useState(employees.length);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data.data.employees);
      setTotalEmployees(response.data.data.employees.length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  const handleAddEmployee = () => {
    fetchEmployees();
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(updatedEmployee);
  };

  const handleSetTotalEmployees = (updatedTotalEmployee) => {
    setTotalEmployees(updatedTotalEmployee);
  };

  return (
    <div className="mx-auto max-w-screen-xl">
      <Navbar />
      <br />
      <main>
        <div>
          <AddEmployee
            onAddEmployee={handleAddEmployee}
            onTotalEmployees={handleSetTotalEmployees}
            totalEmployees={totalEmployees}
          />
        </div>
        <div>
          <Tab activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
        <div>
          {activeTab === "all" && (
            <EmployeeTable
              employees={employees}
              onUpdateEmployee={handleUpdateEmployee}
              onUpdateTotalEmployees={handleSetTotalEmployees}
            />
          )}
          {activeTab === "divisions" && <DivisionTable />}
        </div>
      </main>
    </div>
  );
}

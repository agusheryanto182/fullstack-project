import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "./pagination";
import SearchBar from "./search-bar";
import CustomAlert from "./custom-alert";
import { getEmployees, updateEmployee, deleteEmployee } from "../api/api";
import axios from "axios";

const EmployeeTable = ({
  onUpdateEmployee,
  onUpdateTotalEmployees,
  employees,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [typeAlert, setTypeAlert] = useState("");
  const divisions = JSON.parse(localStorage.getItem("divisions")) || [];

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees({
        name: searchTerm,
      });
      onUpdateEmployee(response.data.data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const closeAlert = () => {
    setAlertMessage(null);
    setTypeAlert("");
  };

  const toggleDropdown = (employeeId) => {
    setActiveDropdown((prev) => (prev === employeeId ? null : employeeId));
  };

  const itemsPerPage = 5;

  const filteredEmployee = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployee.length / itemsPerPage);
  const currentData = filteredEmployee.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteEmployee = async (employee) => {
    try {
      await deleteEmployee(employee.id);

      const updatedEmployees = employees.filter(
        (emp) => emp.id !== employee.id
      );
      setAlertMessage("Karyawan berhasil dihapus");
      setTypeAlert("success");

      onUpdateEmployee(updatedEmployees);
      onUpdateTotalEmployees(updatedEmployees.length);

      closePopup();
    } catch (error) {
      setAlertMessage("Terjadi kesalahan saat menghapus karyawan");
      setTypeAlert("error");
    } finally {
      fetchEmployees();
    }
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    if (
      !updatedEmployee.name ||
      !updatedEmployee.phone ||
      !updatedEmployee.division ||
      !updatedEmployee.position
    ) {
      setAlertMessage("Harap isi semua kolom yang diperlukan.");
      setShowEditPopup(false);
      return;
    }

    try {
      const hasImage = updatedEmployee.image;

      let response;
      if (hasImage) {
        const formData = new FormData();
        for (const key in updatedEmployee) {
          formData.append(key, updatedEmployee[key]);
        }

        response = await axios.post(
          `https://www.sukisushi.works/api/employees/${updatedEmployee.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        response = await axios.put(
          `https://www.sukisushi.works/api/employees/${updatedEmployee.id}`,
          updatedEmployee,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      const updatedEmployees = employees.map((employee) =>
        employee.id === updatedEmployee.id
          ? { ...employee, ...updatedEmployee }
          : employee
      );

      setAlertMessage("Data karyawan telah diperbarui");
      setTypeAlert("success");
      setShowEditPopup(false);

      onUpdateEmployee(updatedEmployees);
    } catch (error) {
      console.log(error);
      setAlertMessage("Terjadi kesalahan saat memperbarui data");
      setTypeAlert("error");
      setShowEditPopup(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ search: searchTerm, page });
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setSearchParams({ search: term, page: 1 });
    setCurrentPage(1);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEditPopup(true);
    setActiveDropdown(null);
  };

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeletePopup(true);
    setActiveDropdown(null);
  };

  const closePopup = () => {
    setShowEditPopup(false);
    setShowDeletePopup(false);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
  }, [searchParams]);

  return (
    <div className="p-6 bg-white dark:bg-black">
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          type={typeAlert}
          onClose={closeAlert}
        />
      )}
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <div className="overflow-x-auto bg-white dark:bg-black shadow-md rounded-lg">
        <table className="min-w-full table-auto text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 dark:text-white text-gray-600">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Division</th>
              <th className="py-3 px-4">Position</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 dark:text-white">
            {currentData.map((employee) => (
              <tr
                key={employee.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="py-3 px-4 flex items-center">
                  <span className="h-8 w-8 bg-gray-200 dark:bg-white dark:text-black rounded-full flex items-center justify-center text-sm font-medium text-white mr-3">
                    {employee.image ? (
                      <img
                        src={employee.image}
                        alt={employee.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      employee.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {employee.division && employee.division.name
                    ? employee.division.name
                    : "-"}
                </td>
                <td className="py-3 px-4">{employee.position}</td>
                <td className="py-3 px-4">
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(new Date(employee.created_at))}
                </td>
                <td className="py-3 px-4 text-right relative">
                  <button
                    className="text-gray-600 dark:text-white hover:text-gray-900"
                    onClick={() => toggleDropdown(employee.id)}
                  >
                    •••
                  </button>
                  {activeDropdown === employee.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 -top-5 w-32 z-10  bg-white dark:bg-gray-800 shadow-lg rounded-md"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => handleEditClick(employee)}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                        onClick={() => handleDeleteClick(employee)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentData.length === 0 && (
        <p className="text-center text-black dark:text-white my-4">
          {searchTerm !== "" ? "Employees not found" : "No employees yet"}
        </p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {showEditPopup && (
        <div className="fixed inset-0 z-50 flex px-4  items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-5 rounded shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-3">Edit Employee</h2>
            <div className="mb-2">
              <label>Name:</label>
              <input
                type="text"
                value={selectedEmployee?.name}
                className="w-full mt-2 p-2 border rounded dark:text-black "
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="mb-2">
              <label>Image:</label>
              <input
                type="file"
                className="w-full mt-2 p-2 border rounded "
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    image: URL.createObjectURL(e.target.files[0]),
                  })
                }
              />
            </div>
            <div className="mb-2">
              <label>Phone:</label>
              <input
                type="number"
                value={selectedEmployee?.phone}
                className="w-full mt-2 p-2 border rounded dark:text-black"
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-2">
              <label>Division:</label>
              <select
                value={selectedEmployee?.division.id || ""}
                className="w-full mt-2 p-2 border rounded dark:text-black"
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    division: e.target.value,
                  })
                }
              >
                <option value="">
                  {selectedEmployee?.division?.name || "Select division"}
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
                value={selectedEmployee?.position}
                className="w-full mt-2 p-2 border rounded dark:text-black"
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    position: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closePopup}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedEmployee) {
                    handleUpdateEmployee(selectedEmployee);
                    closePopup();
                  }
                }}
                className="px-4 py-2 bg-[var(--maroon)] text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex px-4 justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-md md:w-1/3">
            <h2 className="text-xl font-semibold">Confirm Delete</h2>
            <p className="mt-4">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedEmployee?.name}?</span>
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 mr-2 bg-gray-200 rounded dark:text-black"
                onClick={closePopup}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => handleDeleteEmployee(selectedEmployee)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;

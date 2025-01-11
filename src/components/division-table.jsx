import React from "react";
import Pagination from "./pagination";
import { useState, useEffect } from "react";
import SearchBar from "./search-bar";
import { useSearchParams } from "react-router-dom";
import { getDivisions } from "../api/api";

const DivisionTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await getDivisions({
          name: searchTerm,
        });
        console.log(response);
        setDivisions(response.data.data.divisions);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDivisions();
  }, [searchTerm]);

  const itemsPerPage = 5;

  const filteredDivision = divisions.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDivision.length / itemsPerPage);
  const currentData = filteredDivision.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams({ search: searchTerm, page });
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setSearchParams({ search: term, page: 1 });
    setCurrentPage(1);
  };

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
  }, [searchParams]);
  return (
    <div className="p-6 bg-white dark:bg-black">
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <div className="overflow-x-auto bg-white dark:bg-black shadow-md rounded-lg">
        <table className="min-w-full table-auto text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 dark:text-white text-gray-600">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Created At</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 dark:text-white">
            {currentData.map((employee, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="py-3 px-4">{employee.name}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default DivisionTable;

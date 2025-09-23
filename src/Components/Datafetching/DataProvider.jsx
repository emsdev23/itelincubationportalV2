import React, { createContext, useState, useEffect } from "react";
import api from "./api";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [byField, setByField] = useState([]);
  const [byStage, setByStage] = useState([]);
  const [companyDoc, setCompanyDoc] = useState([]);
  const [listOfIncubatees, setListOfIncubatees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startupcompanyDoc, setstartupcompanyDoc] = useState([]);
  const [startupdetails, setstartupdetails] = useState([]);
  const [currentCompanyDetails, setCurrentCompanyDetails] = useState(null);

  const [userid, setUserid] = useState(
    sessionStorage.getItem("userid") || null
  );

  const [roleid, setroleid] = useState(
    sessionStorage.getItem("roleid") || null
  );

  const [fromYear, setFromYear] = useState("2024");
  const [toYear, setToYear] = useState("2025");

  // Helper function to safely extract data from API response
  const extractData = (response, fallback = []) => {
    if (!response) {
      console.warn("Response is undefined or null");
      return fallback;
    }

    // Handle different response structures
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data.data) {
        return response.data.data;
      }
      if (response.data.result) {
        return response.data.result;
      }
    }

    console.warn("Unexpected response structure:", response);
    return fallback;
  };

  // Add this refresh function for company documents
  const refreshCompanyDocuments = async () => {
    try {
      const response = await api.post("/generic/getcollecteddocsdash", {
        userId: Number(roleid) === 1 ? "ALL" : userid,
        startYear: fromYear,
        endYear: toYear,
      });

      const data = extractData(response, []);
      setCompanyDoc(data);
      setstartupcompanyDoc(data);

      return data; // Return the data for immediate use
    } catch (error) {
      console.error("Error refreshing company documents:", error);
      throw error; // Re-throw so caller can handle
    }
  };

  // General data fetch (for admin/users)
  useEffect(() => {
    if (!userid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Make API calls individually to handle errors better
        const apiCalls = [
          {
            name: "stats",
            call: () => api.post("/generic/getstatscom", { userId: userid }),
          },
          {
            name: "field",
            call: () => api.post("/generic/getcombyfield", { userId: userid }),
          },
          {
            name: "stage",
            call: () => api.post("/generic/getcombystage", { userId: userid }),
          },
          {
            name: "documents",
            call: () =>
              api.post("/generic/getcollecteddocsdash", {
                userId: Number(roleid) === 1 ? "ALL" : userid,
                startYear: fromYear,
                endYear: toYear,
              }),
          },
          {
            name: "incubatees",
            call: () =>
              api.post("/generic/getincubatessdash", {
                userId: Number(roleid) === 1 ? "ALL" : userid,
              }),
          },
        ];

        const results = await Promise.allSettled(
          apiCalls.map(({ call }) => call())
        );

        // Process results with individual error handling
        results.forEach((result, index) => {
          const { name } = apiCalls[index];

          if (result.status === "fulfilled") {
            const data = extractData(result.value, []);

            switch (name) {
              case "stats":
                setStats(data);
                break;
              case "field":
                setByField(data);
                break;
              case "stage":
                setByStage(data);
                break;
              case "documents":
                setCompanyDoc(data);
                setstartupcompanyDoc(data); // If they should be the same
                break;
              case "incubatees":
                setListOfIncubatees(data);
                setstartupdetails(data); // If they should be the same
                break;
              default:
                break;
            }
          } else {
            console.error(`Error fetching ${name}:`, result.reason);

            // Set fallback values for failed requests
            switch (name) {
              case "stats":
                setStats(null);
                break;
              case "field":
                setByField([]);
                break;
              case "stage":
                setByStage([]);
                break;
              case "documents":
                setCompanyDoc([]);
                setstartupcompanyDoc([]);
                break;
              case "incubatees":
                setListOfIncubatees([]);
                setstartupdetails([]);
                break;
              default:
                break;
            }
          }
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);

        // Set all states to safe defaults on complete failure
        setStats(null);
        setByField([]);
        setByStage([]);
        setCompanyDoc([]);
        setListOfIncubatees([]);
        setstartupcompanyDoc([]);
        setstartupdetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userid, roleid, fromYear, toYear]);

  return (
    <DataContext.Provider
      value={{
        stats,
        byField,
        byStage,
        companyDoc,
        setCompanyDoc,
        listOfIncubatees,
        loading,
        userid,
        setUserid,
        setroleid,
        fromYear,
        setFromYear,
        toYear,
        setToYear,
        roleid,
        startupcompanyDoc,
        setstartupcompanyDoc,
        startupdetails,
        setstartupdetails,
        currentCompanyDetails,
        setCurrentCompanyDetails,
        refreshCompanyDocuments, // Add this new function
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

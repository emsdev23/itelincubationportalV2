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

  // Add new state for admin viewing specific startup
  const [adminViewingStartupId, setAdminViewingStartupId] = useState(null);
  const [adminStartupLoading, setAdminStartupLoading] = useState(false);

  const [userid, setUserid] = useState(
    sessionStorage.getItem("userid") || null
  );

  const [roleid, setroleid] = useState(
    sessionStorage.getItem("roleid") || null
  );

  const [fromYear, setFromYear] = useState("2025");
  const [toYear, setToYear] = useState("2026");

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
      const targetUserId = adminViewingStartupId || userid;
      const response = await api.post("/generic/getcollecteddocsdash", {
        userId:
          Number(roleid) === 1 && !adminViewingStartupId ? "ALL" : targetUserId,
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

  // Add adminviewData state
  const [adminviewData, setadminviewData] = useState(null);

  // New function to fetch startup data by ID
  const fetchStartupDataById = async (userId) => {
    if (!userId) return;

    setAdminStartupLoading(true);
    setAdminViewingStartupId(userId);

    try {
      // API call for company documents
      const documentsResponse = await api.post(
        "/generic/getcollecteddocsdash",
        {
          userId: userId,
          startYear: fromYear,
          endYear: toYear,
        }
      );

      // API call for startup/incubatee details
      const incubateesResponse = await api.post("/generic/getincubatessdash", {
        userId: userId,
      });

      // Process documents data
      const documentsData = extractData(documentsResponse, []);
      setstartupcompanyDoc(documentsData);

      // Process incubatees data
      const incubateesData = extractData(incubateesResponse, []);
      setstartupdetails(incubateesData);

      console.log("Fetched startup data:", {
        documents: documentsData,
        incubatees: incubateesData,
      });
    } catch (error) {
      console.error("Error fetching startup data by ID:", error);
      setstartupcompanyDoc([]);
      setstartupdetails([]);
    } finally {
      setAdminStartupLoading(false);
    }
  };

  // Effect to fetch data when adminviewData changes
  useEffect(() => {
    if (adminviewData) {
      fetchStartupDataById(adminviewData);
    }
  }, [adminviewData, fromYear, toYear]);

  // New function for admin to fetch specific startup data
  const fetchStartupDataForAdmin = async (startupUserId) => {
    if (Number(roleid) !== 1) {
      console.warn("Only admin can view other startup data");
      return;
    }

    fetchStartupDataById(startupUserId);
  };

  // Function to reset admin view back to admin's own data
  const resetAdminView = () => {
    setAdminViewingStartupId(null);
    setstartupcompanyDoc([]);
    setstartupdetails([]);
  };

  // General data fetch (for admin/users)
  useEffect(() => {
    if (!userid) return;

    // Skip general fetch if admin is viewing specific startup
    if (adminViewingStartupId) return;

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
                // Only set startup data if not admin or if admin is not viewing specific startup
                if (Number(roleid) !== 1) {
                  setstartupcompanyDoc(data);
                }
                break;
              case "incubatees":
                setListOfIncubatees(data);
                // Only set startup data if not admin or if admin is not viewing specific startup
                if (Number(roleid) !== 1) {
                  setstartupdetails(data);
                }
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
                if (Number(roleid) !== 1) {
                  setstartupcompanyDoc([]);
                }
                break;
              case "incubatees":
                setListOfIncubatees([]);
                if (Number(roleid) !== 1) {
                  setstartupdetails([]);
                }
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
        if (Number(roleid) !== 1) {
          setstartupcompanyDoc([]);
          setstartupdetails([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userid, roleid, fromYear, toYear, adminViewingStartupId]);

  return (
    <DataContext.Provider
      value={{
        stats,
        byField,
        byStage,
        companyDoc,
        setCompanyDoc,
        listOfIncubatees,
        setListOfIncubatees,
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
        refreshCompanyDocuments,
        // New admin functions
        fetchStartupDataForAdmin,
        fetchStartupDataById,
        resetAdminView,
        adminViewingStartupId,
        adminStartupLoading,
        adminviewData,
        setadminviewData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

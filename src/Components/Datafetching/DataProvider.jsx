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
  const [currentCompanyDetails, setCurrentCompanyDetails] = useState(null); // Add this

  const [userid, setUserid] = useState(
    sessionStorage.getItem("userid") || null
  );

  const [roleid, setroleid] = useState(
    sessionStorage.getItem("roleid") || null
  );

  const [fromYear, setFromYear] = useState("2024");
  const [toYear, setToYear] = useState("2025");

  // General data fetch (for admin/users)
  useEffect(() => {
    if (!userid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          statsRes,
          fieldRes,
          stageRes,
          docRes,
          incubateesRes,
          startupdocRes,
          startupdetailRes,
        ] = await Promise.all([
          api.post("/generic/getstatscom", { userId: userid }),
          api.post("/generic/getcombyfield", { userId: userid }),
          api.post("/generic/getcombystage", { userId: userid }),
          api.post("/generic/getcollecteddocsdash", {
            userId: Number(roleid) === 1 ? "ALL" : userid,
            startYear: fromYear,
            endYear: toYear,
          }),
          api.post("/generic/getincubatessdash", {
            userId: Number(roleid) === 1 ? "ALL" : userid,
          }),
          // api.post("/generic/getcollecteddocsdash", {
          //   userId: userid,
          //   startYear: fromYear,
          //   endYear: toYear,
          // }),
          // api.post("/generic/getincubatessdash", {
          //   userId: userid,
          // }),
        ]);

        setStats(statsRes.data.data);
        setByField(fieldRes.data.data);
        setByStage(stageRes.data.data);
        setCompanyDoc(docRes.data.data);
        setListOfIncubatees(incubateesRes.data.data);
        setstartupcompanyDoc(startupdocRes.data.data);
        setstartupdetails(startupdetailRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
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
        startupdetails,
        currentCompanyDetails,

        setCurrentCompanyDetails,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

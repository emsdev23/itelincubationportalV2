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
  const [userid, setUserid] = useState(
    sessionStorage.getItem("userid") || null
  ); // ✅ track userid

  const [roleid, setroleid] = useState(
    sessionStorage.getItem("roleid") || null
  ); // ✅ track userid

  const [fromYear, setFromYear] = useState("2024");
  const [toYear, setToYear] = useState("2025");
  useEffect(() => {
    if (!userid) return; // only fetch if userid exists

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, fieldRes, stageRes, docRes, incubateesRes] =
          await Promise.all([
            api.post("/generic/getstatscom", { userId: userid }),
            api.post("/generic/getcombyfield", { userId: userid }),
            api.post("/generic/getcombystage", { userId: userid }),
            api.post("/generic/getcollecteddocsdash", {
              userId: "ALL",
              startYear: fromYear,
              endYear: toYear,
            }),
            api.post("/generic/getincubatessdash", { userId: "ALL" }),
          ]);

        setStats(statsRes.data.data);
        setByField(fieldRes.data.data);
        setByStage(stageRes.data.data);
        setCompanyDoc(docRes.data.data);
        setListOfIncubatees(incubateesRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userid]); // ✅ refetch when userid changes

  console.log(listOfIncubatees);
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
        fromYear,
        setFromYear,
        toYear,
        setToYear,
        roleid, // ✅ expose setUserid so LoginForm can update it
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

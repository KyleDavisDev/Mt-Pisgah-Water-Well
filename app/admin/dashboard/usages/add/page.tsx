"use client";

import { useState, useRef, useEffect } from "react";

import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { Button } from "../../../../components/Button/Button";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";
import TextInput from "../../../../components/TextInput/TextInput";
import Select from "../../../../components/Select/Select";
import Checkbox from "../../../../components/Checkbox/Checkbox";
import { formatNumberWithCommas } from "../../util";

interface UsageVM {
  id: string;
  name: string;
  properties: {
    id: string;
    address: string;
    description: string;
    usages: {
      id: string;
      gallons: string;
    }[];
  }[];
}

interface UserVM {
  id: string;
  name: string;
}

const Page = () => {
  const _defaultErrorMessage = "There was a problem saving the usage. Please refresh your page and try again!";

  const [homeowners, setHomeowners] = useState<UsageVM[]>([]);
  const [users, setUsers] = useState<UserVM[]>([]);
  const [activeGatheredUser, setActiveGatheredUser] = useState<string>("");
  const [usages, setUsages] = useState<{ [key: string]: { previous: string; new: string } }>({});
  const [deltas, setDeltas] = useState<{ [key: string]: number }>({});
  const [dateCollected, setDateCollected] = useState("");
  const [flashMessage, setFlashMessage] = useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [allowNegativeInputs, setAllowNegativeInputs] = useState<boolean>(false);
  const initialized = useRef(false);

  const getUsagesByHomeowner = () => {
    // Fetch data from the API using a GET request
    fetch("/api/usages/get?groupBy=HOMEOWNER", { method: "GET" })
      .then(response => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        // Parse the JSON response
        return response.json();
      })
      .then(data => {
        // Update state with the fetched data

        const usagesCollector: { [key: string]: { previous: string; new: string } } = {};
        const deltasCollector: { [key: string]: number } = {};
        for (let i = 0; i < data.homeowners.length; i++) {
          const homeowner = data.homeowners[i];
          for (let j = 0; j < homeowner.properties.length; j++) {
            const property = homeowner.properties[j];
            if (usagesCollector[property.id.toString()] === undefined) {
              usagesCollector[property.id.toString()] = {
                previous: property.usages[0] ? property.usages[0].gallons : 0,
                new: ""
              };
              deltasCollector[property.id.toString()] = 0;
            }
          }
        }

        setHomeowners(data.homeowners);
        setUsages(usagesCollector);
        setDeltas(deltasCollector);
        setDateCollected(getFormattedFirstDayOfMonth());
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  };

  const getUsersWhoCanGather = () => {
    // Fetch data from the API using a GET request
    fetch("/api/users?permissions=GATHER_USAGES", { method: "GET" })
      .then(response => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        // Parse the JSON response
        return response.json();
      })
      .then(data => {
        // Update state with the fetched data
        setUsers(data.users);
        setActiveGatheredUser(data.users[0].id.toString());
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      getUsagesByHomeowner();
      getUsersWhoCanGather();
    }
  }, []);

  const onFlashClose = () => {
    // clear flash message if was shown
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined
    });
  };

  const safeParseStr = (str: string) => {
    try {
      const num = parseInt(str, 10); // Parse the string to an integer with base 10
      if (isNaN(num)) {
        return 0;
      }
      return num;
    } catch (error) {
      return 0;
    }
  };

  let getFormattedFirstDayOfMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const firstDayOfMonth = "01";

    // Format the first day of the month as 'yyyy-mm-dd'
    return `${year}-${month}-${firstDayOfMonth}`;
  };

  const updateDeltas = (id: string) => {
    const newDeltas = { ...deltas };
    const newUsage = safeParseStr(usages[id].new);
    const previousUsage = safeParseStr(usages[id].previous);
    newDeltas[id] = newUsage - previousUsage;
    setDeltas(newDeltas);
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined
    });
  };

  const onSubmit = async (event: React.FormEvent): Promise<any> => {
    event.preventDefault();

    if (loading) return false;

    if (!allowNegativeInputs) {
      for (const key in deltas) {
        const delta = deltas[key];

        if (delta < 0) {
          setFlashMessage({
            isVisible: true,
            text: "Cannot have a negative usage.",
            type: "alert"
          });
          return;
        }
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/usages/add", {
        method: "POST",
        body: JSON.stringify({
          usages: Object.keys(usages)
            .filter(key => {
              return safeParseStr(usages[key].new) > 0;
            })
            .map(key => {
              return {
                id: key,
                gallons: usages[key].new,
                dateCollected: dateCollected,
                recordedById: activeGatheredUser
              };
            })
        })
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success"
        });

        getUsagesByHomeowner();
      }
    } catch (err: any) {
      console.log(err);
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || _defaultErrorMessage,
        type: "warning"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArticleHolder>
      <h3>Add water usage</h3>
      <div className={"flex flex-row flex-wrap p-6"}>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <div style={{ maxWidth: "380px", width: "100%", marginRight: "25px" }}>
              <TextInput
                onChange={e => {
                  setDateCollected(e.currentTarget.value);
                }}
                id={"dateCollected"}
                type={"date"}
                label={"Date Collected"}
                required={true}
                showLabel={true}
                value={dateCollected}
              />
            </div>

            <div style={{ maxWidth: "380px", width: "100%", marginRight: "25px" }}>
              <Select
                options={users.map(u => {
                  return {
                    name: u.name,
                    value: u.id
                  };
                })}
                onSelect={e => {
                  return setActiveGatheredUser(e.target.value);
                }}
                id={"userWhoGathered"}
                label={"Who Collected the Data?"}
                required={true}
                showLabel={true}
                selectedValue={activeGatheredUser}
              />
            </div>
            <div
              style={{
                maxWidth: "380px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              <Checkbox
                id={"ckbxOverrideRestrictions"}
                isChecked={allowNegativeInputs}
                onChange={() => setAllowNegativeInputs(!allowNegativeInputs)}
                label={"Allow negative usages"}
              />
            </div>
          </div>
          <table className={"w-full text-left border-collapse"}>
            <thead className={"border-collapse"}>
              <tr>
                <th className={"border border-tableBorder p-[8px] table-cell border-collapse text-center"}>
                  Homeowner
                </th>
                <th className={"border border-tableBorder p-[8px] table-cell border-collapse text-center"}>Property</th>
                <th className={"border border-tableBorder p-[8px] table-cell border-collapse text-center"}>
                  Previous Reading
                </th>
                <th className={"border border-tableBorder p-[8px] table-cell border-collapse text-center"}>
                  New Reading
                </th>
                <th className={"border border-tableBorder p-[8px] table-cell border-collapse text-center"}>Usage</th>
              </tr>
            </thead>
            <tbody>
              {homeowners &&
                homeowners.map(homeowner => {
                  return (
                    <tr key={`homeowner_${homeowner.id}`}>
                      <td className={"border border-tableBorder p-[8px] table-cell border-collapse text-center"}>
                        <h4>{homeowner.name}</h4>
                      </td>
                      <td className={"border border-tableBorder table-cell border-collapse text-center p-0"}>
                        {homeowner.properties.map(property => {
                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b-1 border-b-tableBorder last-of-type:border-b-0"
                              }
                              key={`property_${property.id}`}
                            >
                              {property.address}
                            </div>
                          );
                        })}
                      </td>
                      <td className={"border border-tableBorder table-cell border-collapse text-center p-0"}>
                        {homeowner.properties.map((property, index) => {
                          let value;

                          if (!property.usages) value = "0";
                          else if (!property.usages[0]) value = "0";
                          else value = property.usages[0].gallons;

                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b-1 border-b-tableBorder last-of-type:border-b-0"
                              }
                              key={`previous_usage_${index}`}
                            >
                              {formatNumberWithCommas(value)}
                            </div>
                          );
                        })}
                      </td>
                      <td className={"border border-tableBorder table-cell border-collapse text-center p-0"}>
                        {homeowner.properties.map(property => {
                          return (
                            <div
                              className={
                                "flex flex-col w-full items-center h-[65px] border-b-1 border-b-tableBorder last-of-type:border-b-0"
                              }
                              key={`new_usage_${property.id}`}
                            >
                              <div className={"w-1/2"}>
                                <TextInput
                                  className={"mb-0 mt-0"}
                                  id={property.id}
                                  value={usages[property.id].new}
                                  onChange={e => {
                                    const inputValue = e.currentTarget.value;

                                    const newUsages = { ...usages };
                                    newUsages[property.id] = {
                                      ...newUsages[property.id],
                                      new: inputValue.replace(/\D+/, "")
                                    };
                                    setUsages(newUsages);
                                  }}
                                  onBlur={() => updateDeltas(property.id)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </td>
                      <td className={"border border-tableBorder table-cell border-collapse text-center p-0"}>
                        {homeowner.properties.map(p => {
                          const color = deltas[p.id] > 0 ? "green" : "red";
                          return (
                            <div
                              className={
                                "flex justify-center items-center h-[65px] p-[8px] border-b-1 border-b-tableBorder last-of-type:border-b-0"
                              }
                              key={`difference_${p.id}`}
                              style={{ color }}
                            >
                              {deltas[p.id].toLocaleString()}
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className={"flex flex-row justify-around align-center mt-4"}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Saving..." : "Save Usages"}
            </Button>
          </div>
        </form>
      </div>
    </ArticleHolder>
  );
};

export default Page;

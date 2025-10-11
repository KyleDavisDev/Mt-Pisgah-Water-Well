"use client";

import React from "react";
import { Button } from "../../../../components/Button/Button";
import TextInput from "../../../../components/TextInput/TextInput";
import Select from "../../../../components/Select/Select";
import { formatNumberWithCommas } from "../../util";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

interface propertyVM {
  id: string;
  address: string;
  description: string;
  homeowner: {
    id: string;
    name: string;
  };
  usages: {
    id: string;
    gallons: string;
    dateCollected: string;
    isActive: string;
  }[];
}

interface usersWhoCanGatherVM {
  id: string;
  name: string;
}

const Page = () => {
  const [properties, setProperties] = React.useState<propertyVM[]>([]);
  const [usersWhoCanGather, setUsersWhoCanGather] = React.useState<usersWhoCanGatherVM[]>([]);
  const [activeGatheredUser, setActiveGatheredUser] = React.useState<string>("");
  const [usages, setUsages] = React.useState<{ [key: string]: { previous: string; new: string } }>({});
  const [deltas, setDeltas] = React.useState<{ [key: string]: number }>({});
  const [dateCollected, setDateCollected] = React.useState("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const initialized = React.useRef(false);

  const getUsagesByWalkableOrder = React.useCallback(() => {
    // Fetch data from the API using a GET request
    fetch("/api/usages/get?groupBy=WALKABLE", { method: "GET" })
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
        for (let i = 0; i < data.properties.length; i++) {
          const property = data.properties[i];

          if (usagesCollector[property.id.toString()] === undefined) {
            usagesCollector[property.id.toString()] = {
              previous: property.usages[0].gallons,
              new: ""
            };
            deltasCollector[property.id.toString()] = 0;
          }
        }

        setProperties(data.properties);
        setUsages(usagesCollector);
        setDeltas(deltasCollector);
        setDateCollected(getFormattedFirstDayOfMonth());
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  }, []);

  const getUsersWhoCanGather = React.useCallback(() => {
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
        setUsersWhoCanGather(data.users);
        setActiveGatheredUser(data.users[0].id.toString());
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  }, []);

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      getUsagesByWalkableOrder();
      getUsersWhoCanGather();
    }
  }, [getUsagesByWalkableOrder, getUsersWhoCanGather]);

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

    // If person didn't enter anything, assume no changes.
    newDeltas[id] = newUsage === 0 ? 0 : newUsage - previousUsage;

    setDeltas(newDeltas);
  };

  const onSubmit = async (event: React.FormEvent, id: string): Promise<any> => {
    event.preventDefault();

    let usage = usages[id];

    if (deltas[id] < 0) return false;
    if (loading) return false;

    setLoading(true);

    try {
      const data = {
        id: id,
        gallons: usage.new,
        dateCollected: dateCollected,
        recordedById: activeGatheredUser
      };

      const response = await fetch("/api/usages/add", {
        method: "POST",
        body: JSON.stringify({
          usages: [data]
        })
      });

      if (response.ok) {
        getUsagesByWalkableOrder();
      }
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArticleHolder>
      <h3>Add water usage</h3>
      <div className={"p-2"}>
        <div className={"flex flex-row items-center"}>
          <div className={"w-full mr-[25px] max-w-[380px]"}>
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

          <div className={"w-full mr-[25px] max-w-[380px]"}>
            <Select
              className={"[&_select]:h-[47px]"}
              options={usersWhoCanGather.map(u => {
                return {
                  name: u.name,
                  value: u.id
                };
              })}
              onSelect={e => {
                return setActiveGatheredUser(e.target.value);
              }}
              id={"userWhoGathered"}
              label={"Collected By"}
              required={true}
              showLabel={true}
              selectedValue={activeGatheredUser}
            />
          </div>
        </div>

        <div className={"flex flex-right items-center flex-wrap w-full"}>
          {properties.map((property, ind) => {
            return (
              <div
                key={`${property.id}_${ind}`}
                className={`
                max-w-full w-full py-[30px] px-0 mb-5 border-b border-gray-400 box-border
                sm:w-[calc(50%-20px)] sm:m-2.5
                lg:w-[calc(33.333%-20px)]
              `}
              >
                <div className={"flex flex-row justify-between items-baseline"}>
                  <div className={"flex flex-col"}>
                    <h2>{property.address}</h2>
                    <h4>{property.homeowner.name}</h4>
                  </div>
                </div>
                Previous reading: {formatNumberWithCommas(property.usages[0].gallons)}
                <br />
                Delta:{" "}
                {
                  <span style={{ fontWeight: "bold", color: deltas[property.id] >= 0 ? "green" : "red" }}>
                    {deltas[property.id]}
                  </span>
                }
                <form onSubmit={e => onSubmit(e, property.id)} style={{ width: "100%" }}>
                  <TextInput
                    key={`new_single_usage_${property.id}`}
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
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? "Saving..." : "Save Usage"}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </ArticleHolder>
  );
};

export default Page;

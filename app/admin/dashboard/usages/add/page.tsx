"use client";

import React from "react";
import {
  StyledContainer,
  StyledFooterDivs,
  StyledFormContainer,
  StyledTable,
  StyledTd,
  StyledWellContainer
} from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { Button } from "../../../../components/Button/Button";
import { Article } from "../../../../components/Article/Article";
import { TextInput } from "../../../../components/TextInput/TextInput";
import Select from "../../../../components/Select/Select";

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

  // assign state
  const [homeowners, setHomeowners] = React.useState<UsageVM[]>([]);
  const [users, setUsers] = React.useState<UserVM[]>([]);
  const [activeGatheredUser, setActiveGatheredUser] = React.useState<string>("");
  const [usages, setUsages] = React.useState<{ [key: string]: { previous: string; new: string } }>({});
  const [deltas, setDeltas] = React.useState<{ [key: string]: number }>({});
  const [dateCollected, setDateCollected] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });
  const initialized = React.useRef(false);

  const getUsagesByHomeowner = () => {
    // Fetch data from the API using a GET request
    fetch("/api/usages/groupByHomeowner", { method: "GET" })
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
        console.log(data);

        setUsers(data.users);
        setActiveGatheredUser(data.users[0].id.toString());
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  };

  React.useEffect(() => {
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
    }
  };

  return (
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>Add Usage</h3>
            <StyledFormContainer>
              {flashMessage.isVisible && (
                <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
                  {flashMessage.text}
                </FlashMessage>
              )}

              <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <div style={{ maxWidth: "380px", width: "100%", marginRight: "25px" }}>
                    <TextInput
                      onChange={e => {
                        console.log(e.currentTarget.value);
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

                  <div style={{ maxWidth: "380px", width: "100%" }}>
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
                </div>
                <StyledTable>
                  <thead>
                    <tr>
                      <th>Homeowner</th>
                      <th>Property</th>
                      <th>Previous Reading</th>
                      <th>New Reading</th>
                      <th>Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeowners &&
                      homeowners.map(homeowner => {
                        return (
                          <tr key={`homeowner_${homeowner.id}`}>
                            <td>
                              <h4>{homeowner.name}</h4>
                            </td>
                            <StyledTd>
                              {homeowner.properties.map(property => {
                                return <div key={`property_${property.id}`}>{property.address}</div>;
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map((property, index) => {
                                let value = "0";

                                if (!property.usages) value = "0";
                                else if (!property.usages[0]) value = "0";
                                else value = property.usages[0].gallons;

                                return <div key={`previous_usage_${index}`}>{value}</div>;
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map(property => {
                                return (
                                  <TextInput
                                    key={`new_usage_${property.id}`}
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
                                );
                              })}
                            </StyledTd>
                            <StyledTd>
                              {homeowner.properties.map(p => {
                                const color = deltas[p.id] > 0 ? "green" : "red";
                                return (
                                  <div key={`difference_${p.id}`} style={{ color }}>
                                    {deltas[p.id].toLocaleString()}
                                  </div>
                                );
                              })}
                            </StyledTd>
                          </tr>
                        );
                      })}
                  </tbody>
                </StyledTable>
                <StyledFooterDivs>
                  <Button type="submit" fullWidth>
                    Save Usages
                  </Button>
                </StyledFooterDivs>
              </form>
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

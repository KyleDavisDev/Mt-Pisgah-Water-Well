"use client";

import React from "react";
import {
  StyledContainer,
  StyledFooterDivs,
  StyledFormContainer,
  StyledTable,
  StyledTd,
  StyledTile,
  StyledTileContainer,
  StyledWellContainer
} from "./pageStyle";
import Well from "../../../../components/Well/Well";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import { Button } from "../../../../components/Button/Button";
import { Article } from "../../../../components/Article/Article";
import { TextInput } from "../../../../components/TextInput/TextInput";
import Select from "../../../../components/Select/Select";
import Checkbox from "../../../../components/Checkbox/Checkbox";
import { formatNumberWithCommas } from "../../util";
import MoneyInput from "../../../../components/MoneyInput/MoneyInput";

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
  const _defaultErrorMessage = "There was a problem saving the usage. Please refresh your page and try again!";

  const [properties, setProperties] = React.useState<propertyVM[]>([]);
  const [usersWhoCanGather, setUsersWhoCanGather] = React.useState<usersWhoCanGatherVM[]>([]);
  const [activeGatheredUser, setActiveGatheredUser] = React.useState<string>("");
  const [usages, setUsages] = React.useState<{ [key: string]: { previous: string; new: string } }>({});
  const [deltas, setDeltas] = React.useState<{ [key: string]: number }>({});
  const [dateCollected, setDateCollected] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [allowNegativeInputs, setAllowNegativeInputs] = React.useState<boolean>(false);
  const initialized = React.useRef(false);

  const getUsagesByWalkableOrder = () => {
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
        console.log(data);

        const usagesCollector: { [key: string]: { previous: string; new: string } } = {};
        const deltasCollector: { [key: string]: number } = {};
        for (let i = 0; i < data.properties.length; i++) {
          const property = data.properties[i];

          if (usagesCollector[property.id.toString()] === undefined) {
            usagesCollector[property.id.toString()] = {
              previous: property.usages[0] ? property.usages[0].gallons : 0,
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
        setUsersWhoCanGather(data.users);
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

      getUsagesByWalkableOrder();
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

        getUsagesByWalkableOrder();
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
    <StyledContainer>
      <Article size="lg">
        <StyledWellContainer>
          <Well>
            <h3>Add water usage</h3>
            <StyledFormContainer>
              {flashMessage.isVisible && (
                <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
                  {flashMessage.text}
                </FlashMessage>
              )}

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

              <StyledTileContainer>
                {properties.map(property => {
                  return (
                    <StyledTile>
                      <h3>{property.address}</h3>
                      <h4>{property.homeowner.name}</h4>
                      <form>
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
                        <Button type={"submit"} onClick={() => {}} fullWidth={true}>
                          Save
                        </Button>
                      </form>
                      <p>
                        Previous reading: {formatNumberWithCommas(property.usages[property.usages.length - 1].gallons)}
                      </p>
                    </StyledTile>
                  );
                })}

                <StyledTile>
                  <h3>235 Mt Pisgah</h3>
                  <h4>John Smith</h4>
                  <MoneyInput
                    id={"123"}
                    valueInPennies={0}
                    onChange={function (value: number | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                  <p>Previous reading: {formatNumberWithCommas(123131)}</p>
                </StyledTile>
                <StyledTile>
                  <h3>235 Mt Pisgah</h3>
                  <h4>John Smith</h4>
                  <MoneyInput
                    id={"123"}
                    valueInPennies={0}
                    onChange={function (value: number | null): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                  <p>Previous reading: {formatNumberWithCommas(123131)}</p>
                </StyledTile>
              </StyledTileContainer>

              <StyledFooterDivs>
                {/*<Button type="submit" fullWidth disabled={loading}>*/}
                {/*  {loading ? "Saving..." : "Save Usages"}*/}
                {/*</Button>*/}
              </StyledFooterDivs>
            </StyledFormContainer>
          </Well>
        </StyledWellContainer>
      </Article>
    </StyledContainer>
  );
};

export default Page;

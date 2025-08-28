"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../../../../components/Button/Button";
import PropertyEditModal from "./components/PropertyEditModal/PropertyEditModal";
import { homeownerVM } from "../../homeowners/all/page";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

export interface propertyVM {
  street: string;
  description: string;
  isActive: string;
  id: string;
  homeowner: string;
}

const Page = () => {
  // assign state
  const [activeProperties, setActiveProperties] = useState<propertyVM[]>([]);
  const [inactiveProperties, setInactiveProperties] = useState<propertyVM[]>([]);
  const [homeowners, setHomeowners] = useState<homeownerVM[]>([]);

  const [activeProperty, setActiveProperty] = useState<propertyVM | null>();
  const [showModal, setShowModal] = useState(false);
  const initialized = useRef(false);

  const getProperties = () => {
    // Fetch data from the API using a GET request
    fetch("/api/properties", { method: "GET" })
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

        const active: propertyVM[] = [];
        const inActive: propertyVM[] = [];

        data.properties.forEach((p: any) => {
          if (p.isActive === "true") {
            active.push(p);
          } else {
            inActive.push(p);
          }
        });

        setActiveProperties(active);
        setInactiveProperties(inActive);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const getHomeowners = () => {
    // Fetch data from the API using a GET request
    fetch(`/api/homeowners`, { method: "GET" })
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
        setHomeowners(data.homeowners);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getProperties();
      getHomeowners();
    }
  }, []);

  const onModalClose = () => {
    setShowModal(false);
    setActiveProperty(null);
    getProperties();
  };

  if (!initialized.current) {
    return (
      <ArticleHolder>
        <h3>All Properties</h3>
        <div className={"flex flex-row flex-wrap p-6"}>Loading...</div>
      </ArticleHolder>
    );
  }

  return (
    <ArticleHolder>
      <h3>All Properties</h3>
      <div className={"flex flex-row flex-wrap p-6"}>
        {activeProperties.length > 0 && (
          <>
            <h3>Active</h3>
            <table className={"w-full text-left border-collapse mb-[25px]"}>
              <thead className={"border-collapse"}>
                <tr>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Address</th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                    Description
                  </th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                    Homeowner
                  </th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}></th>
                </tr>
              </thead>
              <tbody>
                {activeProperties.map(property => {
                  return (
                    <tr key={property.id}>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        <span
                          style={{
                            height: 10,
                            width: 10,
                            backgroundColor: property.isActive === "true" ? "green" : "red",
                            borderRadius: 50,
                            display: "inline-block",
                            marginRight: 8
                          }}
                        ></span>
                        {property.street}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {property.description}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {property.homeowner}
                      </td>
                      <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                        <Button
                          onClick={() => {
                            setActiveProperty({ ...property });
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {inactiveProperties.length > 0 && (
          <>
            <h3>Inactive</h3>
            <table className={"w-full text-left border-collapse mb-[25px]"}>
              <thead>
                <tr>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Address</th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                    Description
                  </th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                    Homeowner
                  </th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}></th>
                </tr>
              </thead>
              <tbody>
                {inactiveProperties.map(property => {
                  return (
                    <tr key={property.id}>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        <span
                          style={{
                            height: 10,
                            width: 10,
                            backgroundColor: property.isActive === "true" ? "green" : "red",
                            borderRadius: 50,
                            display: "inline-block",
                            marginRight: 8
                          }}
                        ></span>
                        {property.street}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {property.description}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {property.homeowner}
                      </td>
                      <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                        <Button
                          onClick={() => {
                            setActiveProperty({ ...property });
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {activeProperty && (
          <PropertyEditModal
            showModal={showModal}
            property={{ ...activeProperty }}
            onModalClose={onModalClose}
            homeowners={homeowners}
          />
        )}
      </div>
    </ArticleHolder>
  );
};

export default Page;

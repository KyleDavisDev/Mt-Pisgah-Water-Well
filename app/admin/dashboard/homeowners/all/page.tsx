"use client";

import React from "react";
import HomeownerEditModal from "./components/HomeownerEditModal/HomeownerEditModal";
import { Button } from "../../../../components/Button/Button";
import { NotificationDot } from "../../../../components/NotificationDot/NotificationDot";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

export interface homeownerVM {
  name: string;
  email?: string | null;
  phone?: string | null;
  mailingAddress: string;
  isActive: string;
  id: number;
}

const Page = () => {
  // assign state
  const [activeHomeowners, setActiveHomeowners] = React.useState<homeownerVM[]>([]);
  const [inactiveHomeowners, setInactiveHomeowners] = React.useState<homeownerVM[]>([]);
  const [activeHomeowner, setActiveHomeowner] = React.useState<homeownerVM | null>();
  const [showModal, setShowModal] = React.useState(false);
  const initialized = React.useRef(false);

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

        const active: homeownerVM[] = [];
        const inactive: homeownerVM[] = [];

        data.homeowners.forEach((h: any) => {
          if (h.isActive === "true") {
            active.push(h);
          } else {
            inactive.push(h);
          }
        });

        setActiveHomeowners(active);
        setInactiveHomeowners(inactive);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      })
      .finally(() => {});
  };

  const onModalClose = () => {
    setShowModal(false);
    getHomeowners();
  };

  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      getHomeowners();
    }
  }, []);

  if (!initialized.current) {
    return (
      <ArticleHolder>
        <h3>All Homeowners</h3>
        <div className={"flex flex-row flex-wrap p-6"}>Loading...</div>
      </ArticleHolder>
    );
  }

  return (
    <ArticleHolder>
      <h3>All Homeowners</h3>
      <div className={"flex flex-row flex-wrap p-6"}>
        {activeHomeowners.length > 0 ? (
          <>
            <h3>Active</h3>
            <table className={"w-full text-left border-collapse mb-[25px]"}>
              <thead className={"border-collapse"}>
                <tr>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Name</th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                    Mailing Address
                  </th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Email</th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}></th>
                </tr>
              </thead>
              <tbody>
                {activeHomeowners.map((homeowner, ind) => {
                  return (
                    <tr className={"border-b border-tableBorder even:bg-gray-200"} key={`tr__${ind}__${homeowner.id}`}>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        <NotificationDot variant={"success"} />
                        {homeowner.name}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {homeowner.mailingAddress}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {homeowner.email}
                      </td>
                      <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                        <Button
                          onClick={() => {
                            setActiveHomeowner({ ...homeowner });
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
        ) : (
          <></>
        )}

        {inactiveHomeowners.length > 0 ? (
          <>
            <h3>Inactive</h3>
            <table className={"w-full text-left border-collapse mb-[25px]"}>
              <thead className={"border-collapse"}>
                <tr>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Name</th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                    Mailing Address
                  </th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>Email</th>
                  <th className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}></th>
                </tr>
              </thead>
              <tbody>
                {inactiveHomeowners.map((homeowner, ind) => {
                  return (
                    <tr className={"border-b border-tableBorder even:bg-gray-200"} key={`tr__${ind}__${homeowner.id}`}>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        <NotificationDot variant={"danger"} />
                        {homeowner.name}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {homeowner.mailingAddress}
                      </td>
                      <td className={"border border-tableBorder text-left p-[8px] table-cell border-collapse"}>
                        {homeowner.email}
                      </td>
                      <td className={"border border-tableBorder text-center p-[8px] table-cell border-collapse"}>
                        <Button
                          onClick={() => {
                            setActiveHomeowner({ ...homeowner });
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
        ) : (
          <></>
        )}

        {showModal && activeHomeowner && (
          <HomeownerEditModal showModal={showModal} homeowner={{ ...activeHomeowner }} onModalClose={onModalClose} />
        )}
      </div>
    </ArticleHolder>
  );
};

export default Page;

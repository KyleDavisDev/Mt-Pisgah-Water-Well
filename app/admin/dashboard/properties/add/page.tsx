"use client";

import React from "react";
import { FlashMessage, FlashMessageProps } from "../../../../components/FlashMessage/FlashMessage";
import TextInput from "../../../../components/TextInput/TextInput";
import { Button } from "../../../../components/Button/Button";
import Select from "../../../../components/Select/Select";
import { ArticleHolder } from "../../components/ArticleHolder/ArticleHolder";

const page = () => {
  const _defaultErrorMessage = "There was a problem saving the property. Please refresh your page and try again!";

  // assign state
  const [description, setDescription] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [homeowners, setHomeowners] = React.useState<{ name: string; id: string }[]>([]);
  const [homeowner, setHomeowner] = React.useState("");
  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Fetch data from the API using a GET request
    fetch("/api/homeowners")
      .then(response => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        // Parse the JSON response
        return response.json();
      })
      .then(data => {
        const tmp = data.homeowners
          .filter((x: any) => x.isActive === "true")
          .map((x: any) => {
            return {
              name: x.name,
              id: x.id
            };
          });
        // Update state with the fetched data
        setHomeowners(tmp);
        setHomeowner(tmp[0].id);
      })
      .catch(error => {
        // Handle fetch errors
        console.error("Error fetching data:", error);
      });
  }, []);

  const onFlashClose = () => {
    // clear flash message if was shown
    setFlashMessage({
      isVisible: false,
      text: "",
      type: undefined
    });
  };

  const onSubmit = async (event: React.FormEvent): Promise<any> => {
    event.preventDefault();

    if (loading) return false;

    if (!address) {
      setFlashMessage({
        isVisible: true,
        text: "Missing address",
        type: "alert"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/properties/add", {
        method: "POST",
        body: JSON.stringify({
          address,
          description,
          homeowner
        })
      });

      if (response.ok) {
        const data = await response.json();

        setFlashMessage({
          isVisible: true,
          text: data.message,
          type: "success"
        });

        setAddress("");
        setDescription("");
        setHomeowner(homeowners[0].id);
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
      <h3>Add Property</h3>
      <div className={"p-4 flex flex-row flex-wrap"}>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          <TextInput
            onChange={e => setAddress(e.target.value)}
            value={address}
            type={"text"}
            id={"address"}
            showLabel={true}
            label={"Address"}
            name={"address"}
            required={true}
          />
          <TextInput
            onChange={e => setDescription(e.target.value)}
            value={description}
            type={"text"}
            id={"description"}
            showLabel={true}
            label={"Description"}
            name={"description"}
          />
          {homeowners.length === 0 ? (
            <Select
              id="tmp"
              showLabel={true}
              label={"Property belongs to"}
              name={"tmp"}
              options={[{ name: "Loading ...", value: "0" }]}
              onSelect={() => {}}
              selectedValue={""}
              required={true}
            />
          ) : (
            <Select
              id="homeowner"
              showLabel={true}
              label={"Property belongs to"}
              name={"homeowner"}
              options={homeowners.map(h => ({
                name: h.name,
                value: h.id
              }))}
              onSelect={e => {
                return setHomeowner(e.target.value);
              }}
              selectedValue={homeowner}
              required={true}
            />
          )}

          <div className={"flex flex-row justify-around align-center mt-4"}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Adding..." : "Add Property"}
            </Button>
          </div>
        </form>
      </div>
    </ArticleHolder>
  );
};

export default page;

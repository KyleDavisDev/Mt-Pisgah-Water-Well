"use client";

import React from "react";

import { usagesVM } from "../../page";
import TextInput from "../../../../../../components/TextInput/TextInput";
import { Button } from "../../../../../../components/Button/Button";
import { Modal } from "../../../../../../components/Modal/Modal";
import { FlashMessage, FlashMessageProps } from "../../../../../../components/FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../components/RadioButton/RadioButton";
import Label from "../../../../../../components/Label/Label";

export interface UsageEditModalProps {
  showModal: boolean;
  usage: usagesVM;
  onModalClose: () => void;
}

const UsageEditModal = (props: UsageEditModalProps) => {
  const [id, setId] = React.useState(props.usage.id);
  const [gallons, setGallons] = React.useState(props.usage.gallons);
  const [isActive, setIsActive] = React.useState(props.usage.isActive);
  const [loading, setLoading] = React.useState(false);

  const [flashMessage, setFlashMessage] = React.useState<FlashMessageProps>({
    isVisible: false,
    text: "",
    type: undefined
  });

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

    if (loading) return; // Prevent duplicate submissions

    if (!gallons || !id) {
      setFlashMessage({
        isVisible: true,
        text: "Missing Gallons",
        type: "alert"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/usages/update", {
        method: "PUT",
        body: JSON.stringify({
          gallons: gallons,
          id,
          isActive
        })
      });

      if (response.ok) {
        setFlashMessage({
          isVisible: false,
          text: "",
          type: undefined
        });
        setGallons("");

        props.onModalClose();
      }
    } catch (err: any) {
      console.log(err);
      // Create warning flash
      setFlashMessage({
        isVisible: true,
        text: err.response?.data?.msg || "Error",
        type: "warning"
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Modal isActive={props.showModal} onClose={props.onModalClose}>
      <>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          <TextInput
            onChange={e => setGallons(e.target.value)}
            value={gallons}
            type={"text"}
            id={"gallons"}
            showLabel={true}
            label={"Gallons"}
            name={"gallons"}
            required={false}
          />

          <Label>Active</Label>
          <RadioButton
            onClick={() => setIsActive("true")}
            name={"is_active"}
            isChecked={isActive.toLowerCase() === "true"}
            id={"RBisActiveYes"}
            label={"Yes"}
            value={"Yes"}
          />
          <RadioButton
            onClick={() => setIsActive("false")}
            name={"is_active"}
            isChecked={isActive.toLowerCase() === "false"}
            id={"RBisActiveNo"}
            label={"No"}
            value={"No"}
          />

          <div className={"flex flex-row justify-around align-center mt-4"}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Updating..." : "Update Usage"}
            </Button>
          </div>
        </form>
      </>
    </Modal>
  );
};

export default UsageEditModal;

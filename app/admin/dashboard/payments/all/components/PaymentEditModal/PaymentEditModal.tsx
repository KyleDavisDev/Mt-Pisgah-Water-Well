"use client";

import React from "react";

import { paymentData } from "../../page";
import { Button } from "../../../../../../components/Button/Button";
import { Modal } from "../../../../../../components/Modal/Modal";
import { FlashMessage, FlashMessageProps } from "../../../../../../components/FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../components/RadioButton/RadioButton";
import Label from "../../../../../../components/Label/Label";

export interface PaymentEditModalProps {
  showModal: boolean;
  payment: paymentData;
  onModalClose: () => void;
}

const PaymentEditModal = (props: PaymentEditModalProps) => {
  const [id] = React.useState(props.payment.id);
  const [isActive, setIsActive] = React.useState(props.payment.isActive);
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

    if (!id) {
      setFlashMessage({
        isVisible: true,
        text: "Missing data",
        type: "alert"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/payments/update", {
        method: "PUT",
        body: JSON.stringify({
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
              {loading ? "Adding..." : "Add Homeowner"}
            </Button>
          </div>
        </form>
      </>
    </Modal>
  );
};

export default PaymentEditModal;

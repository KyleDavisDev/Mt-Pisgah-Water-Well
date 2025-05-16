"use client";

import React from "react";

import { StyledFooterDivs } from "../../../../homeowners/all/pageStyle";
import { invoiceDTO } from "../../types";
import { Button } from "../../../../../../components/Button/Button";
import { Modal } from "../../../../../../components/Modal/Modal";
import { FlashMessage, FlashMessageProps } from "../../../../../../components/FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../components/RadioButton/RadioButton";
import Label from "../../../../../../components/Label/Label";

export interface InvoiceEditModalProps {
  showModal: boolean;
  invoice: invoiceDTO;
  onModalClose: (refreshData: boolean) => void;
}

const InvoiceEditModal = (props: InvoiceEditModalProps) => {
  const [id, setId] = React.useState(props.invoice.id);
  const [gallons, setGallons] = React.useState(props.invoice.gallonsUsed);
  const [isActive, setIsActive] = React.useState(props.invoice.isActive);
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
      const response = await fetch("/api/invoices/update", {
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

        props.onModalClose(true);
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
    <Modal isActive={props.showModal} onClose={() => props.onModalClose(false)}>
      <>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          What should be editable?
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
          <StyledFooterDivs>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </StyledFooterDivs>
        </form>
      </>
    </Modal>
  );
};

export default InvoiceEditModal;

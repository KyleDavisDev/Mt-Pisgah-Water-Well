import { TextInput } from "../../../../../../TextInput/TextInput";
import { StyledFooterDivs } from "../../../HomeownersAdd/HomeownersAddStyle";
import { Button } from "../../../../../../Button/Button";
import { Modal } from "../../../../../../Modal/Modal";
import React from "react";
import { usagesVM } from "../../UsagesView";
import { FlashMessage, FlashMessageProps } from "../../../../../../FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../RadioButton/RadioButton";
import Label from "../../../../../../Label/Label";

export interface UsageEditModalProps {
  showModal: boolean;
  usage: usagesVM;
  onModalClose: () => void;
}

const UsageEditModal = (props: UsageEditModalProps) => {
  const [id, setId] = React.useState(props.usage.id);
  const [gallons, setGallons] = React.useState(props.usage.gallons);
  const [isActive, setIsActive] = React.useState(props.usage.isActive);

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

    if (!gallons || !id) {
      setFlashMessage({
        isVisible: true,
        text: "Missing Gallons",
        type: "alert"
      });
      return;
    }

    try {
      const response = await fetch("/api/usages/update", {
        method: "POST",
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

          <StyledFooterDivs>
            <Button type="submit" fullWidth>
              Save
            </Button>
          </StyledFooterDivs>
        </form>
      </>
    </Modal>
  );
};

export default UsageEditModal;

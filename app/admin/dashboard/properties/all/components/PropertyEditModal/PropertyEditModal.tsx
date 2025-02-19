"use client";

import React from "react";
import { propertyVM } from "../../page";
import { homeownerVM } from "../../../../homeowners/all/page";
import { StyledFooterDivs } from "../../../../homeowners/all/pageStyle";

import { TextInput } from "../../../../../../components/TextInput/TextInput";
import { Button } from "../../../../../../components/Button/Button";
import { Modal } from "../../../../../../components/Modal/Modal";
import { FlashMessage, FlashMessageProps } from "../../../../../../components/FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../components/RadioButton/RadioButton";
import Label from "../../../../../../components/Label/Label";
import Select from "../../../../../../components/Select/Select";

export interface PropertyEditModalProps {
  showModal: boolean;
  property: propertyVM;
  homeowners: homeownerVM[];
  onModalClose: () => void;
}

const PropertyEditModal = (props: PropertyEditModalProps) => {
  const [id, setId] = React.useState(props.property.id);
  const [description, setDescription] = React.useState(props.property.description);
  const [isActive, setIsActive] = React.useState(props.property.isActive);
  const [address, setAddress] = React.useState(props.property.address);
  const homeowner = props.homeowners.find(h => h.name === props.property.homeowner);
  const activeId = homeowner?.id ? homeowner.id.toString() : "";
  const [activeHomeownerId, setActiveHomeownerId] = React.useState(activeId);

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

  const onSubmit = async (event?: React.FormEvent): Promise<any> => {
    event?.preventDefault();

    if (!address || !id || !activeHomeownerId) {
      setFlashMessage({
        isVisible: true,
        text: "Missing address",
        type: "alert"
      });
      return;
    }

    try {
      const response = await fetch("/api/properties/update", {
        method: "PUT",
        body: JSON.stringify({
          description,
          id,
          isActive,
          homeownerId: activeHomeownerId
        })
      });

      if (response.ok) {
        setFlashMessage({
          isVisible: false,
          text: "",
          type: undefined
        });
        setDescription("");
        setAddress("");

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

  const onKeyUpEvent = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      onSubmit();
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

        <form onKeyUp={e => onKeyUpEvent(e)} onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          <TextInput
            onChange={e => setAddress(e.target.value)}
            value={address}
            type={"text"}
            id={"address"}
            showLabel={true}
            label={"Mailing Address"}
            name={"address"}
            required={true}
            disabled={true}
          />

          <TextInput
            onChange={e => setDescription(e.target.value)}
            value={description}
            type={"text"}
            id={"description"}
            showLabel={true}
            label={"Description"}
            name={"description"}
            required={false}
          />

          <Select
            id="homeowner"
            showLabel={true}
            label={"Property belongs to"}
            name={"homeowner"}
            options={props.homeowners.map(h => ({
              name: h.name,
              value: h.id.toString()
            }))}
            onSelect={e => {
              return setActiveHomeownerId(e.target.value);
            }}
            selectedValue={activeHomeownerId}
            required={true}
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

export default PropertyEditModal;

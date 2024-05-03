import { TextInput } from "../../../../../../TextInput/TextInput";
import { StyledFooterDivs } from "../../../HomeownersAdd/HomeownersAddStyle";
import { Button } from "../../../../../../Button/Button";
import { Modal } from "../../../../../../Modal/Modal";
import React from "react";
import { propertyVM } from "../../PropertyView";
import { FlashMessage, FlashMessageProps } from "../../../../../../FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../RadioButton/RadioButton";
import Label from "../../../../../../Label/Label";

export interface PropertyEditModalProps {
  showModal: boolean;
  property: propertyVM;
  onModalClose: () => void;
}

const PropertyEditModal = (props: PropertyEditModalProps) => {
  console.log(props);
  const [id, setId] = React.useState(props.property.id);
  const [description, setDescription] = React.useState(props.property.description);
  const [isActive, setIsActive] = React.useState(props.property.isActive);
  const [address, setAddress] = React.useState(props.property.address);

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

    if (!address || !id) {
      setFlashMessage({
        isVisible: true,
        text: "Missing address",
        type: "alert"
      });
      return;
    }

    try {
      const response = await fetch("/api/properties/update", {
        method: "POST",
        body: JSON.stringify({
          description,
          address,
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

  return (
    <Modal isActive={props.showModal} onClose={props.onModalClose}>
      <>
        {flashMessage.isVisible && (
          <FlashMessage type={flashMessage.type} isVisible onClose={onFlashClose}>
            {flashMessage.text}
          </FlashMessage>
        )}

        <form onSubmit={e => onSubmit(e)} style={{ width: "100%" }}>
          {/*<TextInput*/}
          {/*  onChange={e => setEmail(e.target.value)}*/}
          {/*  value={email}*/}
          {/*  type={"text"}*/}
          {/*  id={"email"}*/}
          {/*  showLabel={true}*/}
          {/*  label={"Email"}*/}
          {/*  name={"email"}*/}
          {/*/>*/}
          {/*<TextInput*/}
          {/*  onChange={e => setPhone(e.target.value)}*/}
          {/*  value={phone}*/}
          {/*  type={"text"}*/}
          {/*  id={"phone"}*/}
          {/*  showLabel={true}*/}
          {/*  label={"Phone number"}*/}
          {/*  name={"phone"}*/}
          {/*/>*/}
          <TextInput
            onChange={e => setAddress(e.target.value)}
            value={address}
            type={"text"}
            id={"address"}
            showLabel={true}
            label={"Mailing Address"}
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
            required={false}
          />

          <Label>Active</Label>
          <RadioButton
            onClick={() => setIsActive("true")}
            name={"is_active"}
            checked={props.property.isActive.toLowerCase() === "true"}
            id={"RBisActiveYes"}
            label={"Yes"}
            value={"Yes"}
          />
          <RadioButton
            onClick={() => setIsActive("false")}
            name={"is_active"}
            checked={props.property.isActive.toLowerCase() === "false"}
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

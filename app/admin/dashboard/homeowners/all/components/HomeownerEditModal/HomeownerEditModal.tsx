import React from "react";
import { homeownerVM } from "../../page";

import { FlashMessage, FlashMessageProps } from "../../../../../../components/FlashMessage/FlashMessage";
import { RadioButton } from "../../../../../../components/RadioButton/RadioButton";
import TextInput from "../../../../../../components/TextInput/TextInput";
import { Button } from "../../../../../../components/Button/Button";
import { Modal } from "../../../../../../components/Modal/Modal";
import Label from "../../../../../../components/Label/Label";

export interface HomeownerEditModalProps {
  showModal: boolean;
  homeowner: homeownerVM;
  onModalClose: () => void;
}

const HomeownerEditModal = (props: HomeownerEditModalProps) => {
  const [id, setId] = React.useState(props.homeowner.id);
  const [name, setName] = React.useState(props.homeowner.name);
  const [email, setEmail] = React.useState(props.homeowner.email);
  const [phone, setPhone] = React.useState(props.homeowner.phone);
  const [isActive, setIsActive] = React.useState(props.homeowner.isActive);
  const [mailingAddress, setMailingAddress] = React.useState(props.homeowner.mailingAddress);
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

  const onSubmit = async (event?: React.FormEvent): Promise<any> => {
    event?.preventDefault();

    if (loading) return; // Prevent duplicate submissions

    if (!name || !mailingAddress || !id) {
      setFlashMessage({
        isVisible: true,
        text: "Missing name or mailing address",
        type: "alert"
      });
      return;
    }

    setLoading(true); // Set loading to true to disable the button

    try {
      const response = await fetch("/api/homeowners/update", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          phone,
          mailingAddress,
          id,
          isActive: isActive
        })
      });

      if (response.ok) {
        setFlashMessage({
          isVisible: false,
          text: "",
          type: undefined
        });
        setName("");
        setPhone("");
        setEmail("");
        setMailingAddress("");

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
            onChange={e => setName(e.target.value)}
            value={name}
            type={"text"}
            id={"name"}
            showLabel={true}
            label={"Name"}
            name={"name"}
            required={true}
          />
          <TextInput
            onChange={e => setEmail(e.target.value)}
            value={email ?? ""}
            type={"text"}
            id={"email"}
            showLabel={true}
            label={"Email"}
            name={"email"}
          />
          <TextInput
            onChange={e => setPhone(e.target.value)}
            value={phone ?? ""}
            type={"text"}
            id={"phone"}
            showLabel={true}
            label={"Phone number"}
            name={"phone"}
          />
          <TextInput
            onChange={e => setMailingAddress(e.target.value)}
            value={mailingAddress}
            type={"text"}
            id={"mailingAddress"}
            showLabel={true}
            label={"Mailing Address"}
            name={"mailingAddress"}
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

          <div className={"flex flex-row justify-around align-center mt-4"}>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </>
    </Modal>
  );
};

export default HomeownerEditModal;

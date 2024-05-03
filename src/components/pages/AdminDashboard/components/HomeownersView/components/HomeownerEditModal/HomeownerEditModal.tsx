import { TextInput } from "../../../../../../TextInput/TextInput";
import { StyledFooterDivs } from "../../../HomeownersAdd/HomeownersAddStyle";
import { Button } from "../../../../../../Button/Button";
import { Modal } from "../../../../../../Modal/Modal";
import React from "react";
import { homeownerVM } from "../../HomeownersView";

export interface HomeownerEditModalProps {
  showModal: boolean;
  homeowner: homeownerVM;
  onModalClose: () => void;
}

const HomeownerEditModal = (props: HomeownerEditModalProps) => {
  const [name, setName] = React.useState(props.homeowner.name);
  const [email, setEmail] = React.useState(props.homeowner.email);
  const [phone, setPhone] = React.useState(props.homeowner.phone);
  const [mailingAddress, setMailingAddress] = React.useState(
    props.homeowner.mailingAddress,
  );

  const onSubmit = async (event: React.FormEvent): Promise<any> => {
    event.preventDefault();

    // if (!name || !mailingAddress) {
    //   setFlashMessage({
    //     isVisible: true,
    //     text: "Missing name or password",
    //     type: "alert",
    //   });
    //   return;
    // }
    //
    // try {
    //   const response = await fetch("/api/homeowners/add", {
    //     method: "POST",
    //     body: JSON.stringify({ name, email, phone, mailingAddress }),
    //   });
    //
    //   if (response.ok) {
    //     const data = await response.json();
    //
    //     setFlashMessage({
    //       isVisible: true,
    //       text: data.message,
    //       type: "success",
    //     });
    //
    //     setUsername("");
    //     setPhone("");
    //     setEmail("");
    //     setMailingAddress("");
    //   }
    // } catch (err: any) {
    //   console.log(err);
    //   // Create warning flash
    //   setFlashMessage({
    //     isVisible: true,
    //     text: err.response?.data?.msg || _defaultErrorMessage,
    //     type: "warning",
    //   });
    // }
  };

  return (
    <Modal isActive={props.showModal} onClose={props.onModalClose}>
      <form onSubmit={(e) => onSubmit(e)} style={{ width: "100%" }}>
        <TextInput
          onChange={(e) => setName(e.target.value)}
          value={name}
          type={"text"}
          id={"name"}
          showLabel={true}
          label={"Name"}
          name={"name"}
          required={true}
        />
        <TextInput
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type={"text"}
          id={"email"}
          showLabel={true}
          label={"Email"}
          name={"email"}
        />
        <TextInput
          onChange={(e) => setPhone(e.target.value)}
          value={phone}
          type={"text"}
          id={"phone"}
          showLabel={true}
          label={"Phone number"}
          name={"phone"}
        />
        <TextInput
          onChange={(e) => setMailingAddress(e.target.value)}
          value={mailingAddress}
          type={"text"}
          id={"mailingAddress"}
          showLabel={true}
          label={"Mailing Address"}
          name={"mailingAddress"}
          required={true}
        />
        <StyledFooterDivs>
          <Button type="submit" fullWidth>
            Save
          </Button>
        </StyledFooterDivs>
      </form>
    </Modal>
  );
};

export default HomeownerEditModal;

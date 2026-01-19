import { Modal, ModalProps } from "@mantine/core";
import { GetAllCountryReturnType } from "@repo/types";

interface CountryModalProps extends ModalProps {
  selectedCountries: GetAllCountryReturnType[] | null | undefined;
  onSelectCountry: (country: GetAllCountryReturnType) => void;
  data: GetAllCountryReturnType[];
}

const CountryModal = ({
  selectedCountries,
  onSelectCountry,
  data,
  ...props
}: CountryModalProps) => {
  return <Modal {...props}></Modal>;
};

export default CountryModal;

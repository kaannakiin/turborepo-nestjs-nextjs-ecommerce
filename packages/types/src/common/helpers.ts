import {
  CountryCallingCode,
  getCountries,
  getCountryCallingCode,
} from "libphonenumber-js";

export const isPhoneJustCallingCode = (phone: string): boolean => {
  const callingCodes = getCountryCodes();
  return callingCodes.includes(phone as CountryCallingCode);
};

export const getCountryCodes = (): string[] => {
  const countryCodes = getCountries();
  const callingCodes = countryCodes.map(
    (code) => `+${getCountryCallingCode(code)}`
  ) as CountryCallingCode[];
  return callingCodes;
};

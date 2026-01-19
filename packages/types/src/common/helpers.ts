import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export const isValidPhoneNumber = (phone: string): boolean => {
  try {
    const parsedNumber = phoneUtil.parse(phone);
    return phoneUtil.isValidNumber(parsedNumber);
  } catch {
    return false;
  }
};

export const getCountryCodes = (): string[] => {
  const regions = phoneUtil.getSupportedRegions();
  const callingCodes = regions.map((region: string) => {
    const code = phoneUtil.getCountryCodeForRegion(region);
    return `+${code}`;
  });
  return [...new Set(callingCodes)] as string[]; // Unique değerlert
};

export const isPhoneJustCallingCode = (phone: string): boolean => {
  const callingCodes = getCountryCodes();
  return callingCodes.includes(phone);
};

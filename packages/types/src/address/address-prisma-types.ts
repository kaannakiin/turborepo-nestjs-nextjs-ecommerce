import { Prisma } from "@repo/database/client";

export type UserDbAddressType = Prisma.AddressSchemaGetPayload<{
  include: {
    city: {
      select: { id: true; name: true };
    };
    country: {
      select: {
        id: true;
        translations: { select: { name: true; locale: true } };
        emoji: true;
        name: true;
        type: true;
      };
    };
    state: {
      select: { id: true; name: true };
    };
  };
}>;

export type GetAllCountryReturnType = Prisma.CountryGetPayload<{
  select: {
    translations: {
      select: {
        name: true;
        locale: true;
      };
    };
    id: true;
    emoji: true;
    type: true;
  };
}>;

export type GetAllCityReturnType = Prisma.CityGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;

export type GetAllStateReturnType = Prisma.StateGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;

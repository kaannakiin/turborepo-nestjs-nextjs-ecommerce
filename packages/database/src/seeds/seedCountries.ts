import { CountryType, Locale, PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

async function fetchCountries() {
  await prisma.cityTranslation.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.stateTranslation.deleteMany({});
  await prisma.state.deleteMany({});
  await prisma.countryTranslation.deleteMany({});
  await prisma.country.deleteMany({});

  console.log("Cleared existing countries, states, and cities");

  const countryQuery = {
    query: `{
      listCountry {
        id
        name
        locationTranslations {
          tr
          en
        }
        iso2
        iso3
        phoneCode
        capital
        currency
        native
        region
        subregion
        emoji
        emojiString
      }
    }`,
  };

  const response = await fetch("https://api.myikas.com/api/v1/admin/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(countryQuery),
  });

  if (!response.ok) {
    throw new Error(`Error fetching countries: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data: {
      listCountry: Array<{
        id: string;
        name: string;
        capital: string | null;
        currency: string | null;
        emoji: string | null;
        iso2: string | null;
        iso3: string | null;
        locationTranslations: {
          tr: string | null;
          en: string | null;
        };
        native: string | null;
        phoneCode: string | null;
        region: string | null;
        subregion: string | null;
      }>;
    };
  };

  console.log(`Fetched ${data.data.listCountry.length} countries`);

  if (data.data.listCountry.length === 0) {
    throw new Error("No countries found");
  }

  for (const country of data.data.listCountry) {
    console.log(`Processing country: ${country.name}`);

    // Önce state'leri kontrol et
    const stateQuery = {
      query: `{
        listState(countryId: { eq: "${country.id}" }) {
          id
          name
          stateCode
          countryId
        }
      }`,
    };

    const stateResponse = await fetch(
      "https://api.myikas.com/api/v1/admin/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stateQuery),
      }
    );

    if (!stateResponse.ok) {
      console.log(`Failed to fetch states for ${country.name}`);
      continue;
    }

    const stateData = (await stateResponse.json()) as {
      data: {
        listState: Array<{
          id: string;
          name: string;
          stateCode: string | null;
          countryId: string;
        }>;
      };
    };

    // Ülke tipini belirle ve şehir çekme durumunu kontrol et
    let countryType: CountryType;
    let shouldFetchCities = false;

    if (stateData.data.listState.length === 0) {
      console.log(`No states found for country ${country.name}, skipping...`);
      continue;
    } else if (
      stateData.data.listState.length === 1 &&
      stateData.data.listState[0].name === "Default"
    ) {
      // Sadece 1 state varsa VE adı "Default" ise, tip CITY olacak ve şehirleri çekeceğiz
      countryType = CountryType.CITY;
      shouldFetchCities = true;
      console.log(
        `${country.name} has only 1 state with name "Default", setting type to CITY`
      );
    } else {
      // Birden fazla state varsa VEYA tek state'in adı "Default" değilse, tip STATE kalacak ve şehir çekmeyeceğiz
      countryType = CountryType.STATE;
      shouldFetchCities = false;
      console.log(
        `${country.name} has ${stateData.data.listState.length} states or state name is not "Default", setting type to STATE`
      );
    }

    // Ülkeyi veritabanına kaydet
    await prisma.country.create({
      data: {
        id: country.id,
        name: country.name,
        capital: country.capital,
        currency: country.currency,
        emoji: country.emoji,
        iso2: country.iso2,
        iso3: country.iso3,
        native: country.native,
        phoneCode: country.phoneCode,
        region: country.region,
        subregion: country.subregion,
        type: countryType,
        translations: {
          createMany: {
            data: [
              ...(country.locationTranslations.tr
                ? [{ locale: Locale.TR, name: country.locationTranslations.tr }]
                : []),
              ...(country.locationTranslations.en
                ? [{ locale: Locale.EN, name: country.locationTranslations.en }]
                : []),
            ],
          },
        },
      },
    });

    // State'leri kaydet
    for (const state of stateData.data.listState) {
      await prisma.state.create({
        data: {
          id: state.id,
          name: state.name,
          stateCode: state.stateCode,
          countryId: state.countryId,
        },
      });
      console.log(`Created state: ${state.name}`);
    }

    // Eğer tek state varsa ve adı "Default" ise, o state için şehirleri çek
    if (shouldFetchCities) {
      const defaultState = stateData.data.listState[0];
      console.log(
        `Fetching cities for ${country.name} (Default state: ${defaultState.name})`
      );

      const cityQuery = {
        query: `{
          listCity(stateId: { eq: "${defaultState.id}" }) {
            id
            countryId
            stateId
            name
            latitude
            longitude
          }
        }`,
      };

      const cityResponse = await fetch(
        "https://api.myikas.com/api/v1/admin/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cityQuery),
        }
      );

      if (cityResponse.ok) {
        const cityData = (await cityResponse.json()) as {
          data: {
            listCity: Array<{
              id: string;
              countryId: string;
              stateId: string;
              name: string;
              latitude: string | null;
              longitude: string | null;
            }>;
          };
        };

        console.log(
          `Found ${cityData.data.listCity.length} cities for ${country.name}`
        );

        // Şehirleri kaydet
        for (const city of cityData.data.listCity) {
          await prisma.city.create({
            data: {
              id: city.id,
              name: city.name,
              latitude: city.latitude,
              longitude: city.longitude,
              countryId: city.countryId,
              stateId: city.stateId,
            },
          });
        }
        console.log(
          `Created ${cityData.data.listCity.length} cities for ${country.name}`
        );
      } else {
        console.log(`Failed to fetch cities for ${country.name}`);
      }
    }

    console.log(`Completed processing ${country.name}`);
  }

  console.log("Seed completed successfully!");
}

fetchCountries().catch(console.error);

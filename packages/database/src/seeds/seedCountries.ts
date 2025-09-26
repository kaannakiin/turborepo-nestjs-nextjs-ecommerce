import { CountryType, Locale, PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

async function fetchCountries() {
  await prisma.city.deleteMany({});
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

    // Ülke tipini belirle
    let countryType: CountryType;
    let shouldFetchCities = false;
    let shouldCreateStates = false;

    if (stateData.data.listState.length === 0) {
      console.log(
        `No states found for country ${country.name}, setting type to NONE`
      );
      countryType = CountryType.NONE;
    } else if (
      stateData.data.listState.length === 1 &&
      stateData.data.listState[0].name === "Default"
    ) {
      // Tek state varsa VE adı "Default" ise, tip CITY olacak ve şehirleri direkt country'ye bağlayacağız
      countryType = CountryType.CITY;
      shouldFetchCities = true;
      shouldCreateStates = false; // Default state'i kaydetmeyeceğiz
      console.log(
        `${country.name} has only 1 default state, setting type to CITY and will fetch cities directly`
      );
    } else {
      // Birden fazla state varsa VEYA tek state'in adı "Default" değilse, tip STATE kalacak
      countryType = CountryType.STATE;
      shouldCreateStates = true;
      console.log(
        `${country.name} has ${stateData.data.listState.length} real states, setting type to STATE`
      );
    }

    // Ülkeyi veritabanına kaydet
    try {
      console.log(
        `Creating country: ${country.name} with type: ${countryType}`
      );
      console.log(`Country data:`, {
        id: country.id,
        name: country.name,
        type: countryType,
        translations: {
          tr: country.locationTranslations.tr,
          en: country.locationTranslations.en,
        },
      });

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
                  ? [
                      {
                        locale: Locale.TR,
                        name: country.locationTranslations.tr,
                      },
                    ]
                  : []),
                ...(country.locationTranslations.en
                  ? [
                      {
                        locale: Locale.EN,
                        name: country.locationTranslations.en,
                      },
                    ]
                  : []),
              ],
            },
          },
        },
      });
      console.log(`Successfully created country: ${country.name}`);
    } catch (error) {
      console.error(`❌ Error creating country ${country.name}:`, error);
      console.error(
        `Country data that failed:`,
        JSON.stringify(country, null, 2)
      );
      throw error; // Re-throw to stop execution
    }

    // Sadece gerçek state'leri kaydet (Default state'leri değil)
    if (shouldCreateStates) {
      console.log(
        `Creating ${stateData.data.listState.length} states for ${country.name}`
      );
      for (const state of stateData.data.listState) {
        try {
          await prisma.state.create({
            data: {
              id: state.id,
              name: state.name,
              stateCode: state.stateCode,
              countryId: state.countryId,
            },
          });
          console.log(`✅ Created state: ${state.name} for ${country.name}`);
        } catch (error) {
          console.error(
            `❌ Error creating state ${state.name} for ${country.name}:`,
            error
          );
          console.error(
            `State data that failed:`,
            JSON.stringify(state, null, 2)
          );
          throw error;
        }
      }
    }

    // CITY tipindeki ülkeler için şehirleri direkt country'ye bağla
    if (shouldFetchCities) {
      const defaultState = stateData.data.listState[0];
      console.log(
        `Fetching cities for ${country.name} from default state: ${defaultState.name} (ID: ${defaultState.id})`
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

      try {
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

        if (!cityResponse.ok) {
          console.error(
            `❌ Failed to fetch cities for ${country.name}. Status: ${cityResponse.status}`
          );
          console.error(`Response text:`, await cityResponse.text());
        } else {
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

          // Şehirleri direkt country'ye bağla
          for (const city of cityData.data.listCity) {
            try {
              console.log(
                `Creating city: ${city.name} for country: ${country.name}`
              );
              await prisma.city.create({
                data: {
                  id: city.id,
                  name: city.name,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  countryId: city.countryId, // Direkt country'ye bağla
                },
              });
              console.log(`✅ Created city: ${city.name}`);
            } catch (error) {
              console.error(
                `❌ Error creating city ${city.name} for ${country.name}:`,
                error
              );
              console.error(
                `City data that failed:`,
                JSON.stringify(city, null, 2)
              );
              throw error;
            }
          }
          console.log(
            `✅ Created ${cityData.data.listCity.length} cities directly linked to ${country.name}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error fetching/processing cities for ${country.name}:`,
          error
        );
        // Continue processing other countries instead of throwing
      }
    }

    console.log(`Completed processing ${country.name} (type: ${countryType})`);
  }

  console.log("Seed completed successfully!");
}

fetchCountries().catch(console.error);

import * as readline from "readline";
import { CountryType, Locale } from "../../generated/prisma/enums.js";
import { Prisma, prisma } from "../index";
const TURKEY_DB_ID = "da8c5f2a-8d37-48a8-beff-6ab3793a1861";

// Kullanıcıdan input almak için yardımcı fonksiyon
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function fetchCountries() {
  try {
    console.log("\n🧹 Clearing existing data...");
    await prisma.district.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    await prisma.countryTranslation.deleteMany({});
    await prisma.country.deleteMany({});
    console.log("✅ Cleared existing countries, states, cities, and districts");

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

    console.log("\n🌍 Fetching countries from API...");
    const response = await fetch(
      "https://api.myikas.com/api/v1/admin/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(countryQuery),
      }
    );

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

    console.log(`✅ Fetched ${data.data.listCountry.length} countries`);

    if (data.data.listCountry.length === 0) {
      throw new Error("No countries found");
    }

    let processedCountries = 0;
    let failedCountries = 0;

    for (const country of data.data.listCountry) {
      try {
        console.log(`\n📍 Processing country: ${country.name}`);

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
          console.log(`⚠️ Failed to fetch states for ${country.name}`);
          failedCountries++;
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
          countryType = CountryType.NONE;
          console.log(`   Type: NONE (no states)`);
        } else if (
          stateData.data.listState.length === 1 &&
          stateData.data.listState[0].name === "Default"
        ) {
          countryType = CountryType.CITY;
          shouldFetchCities = true;
          shouldCreateStates = false;
          console.log(`   Type: CITY (default state only)`);
        } else {
          countryType = CountryType.STATE;
          shouldCreateStates = true;
          console.log(
            `   Type: STATE (${stateData.data.listState.length} states)`
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
        console.log(`   ✅ Country created`);

        // Sadece gerçek state'leri kaydet
        if (shouldCreateStates) {
          for (const state of stateData.data.listState) {
            await prisma.state.create({
              data: {
                id: state.id,
                name: state.name,
                stateCode: state.stateCode,
                countryId: state.countryId,
              },
            });
          }
          console.log(
            `   ✅ Created ${stateData.data.listState.length} states`
          );
        }

        // CITY tipindeki ülkeler için şehirleri direkt country'ye bağla
        if (shouldFetchCities) {
          const defaultState = stateData.data.listState[0];

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

            for (const city of cityData.data.listCity) {
              await prisma.city.create({
                data: {
                  id: city.id,
                  name: city.name,
                  latitude: city.latitude,
                  longitude: city.longitude,
                  countryId: city.countryId,
                },
              });
            }
            console.log(
              `   ✅ Created ${cityData.data.listCity.length} cities`
            );
          }
        }

        processedCountries++;
      } catch (error) {
        console.error(`   ❌ Error processing ${country.name}:`, error);
        failedCountries++;
        continue;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Countries seed completed!");
    console.log(`   Processed: ${processedCountries}`);
    console.log(`   Failed: ${failedCountries}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Fatal error in fetchCountries:", error);
    throw error;
  }
}

async function seedTurkeyDistricts() {
  try {
    console.log("\n🇹🇷 Starting Turkey districts seed...");

    // Önce mevcut district'leri temizle
    const deletedDistricts = await prisma.district.deleteMany({
      where: {
        city: {
          countryId: TURKEY_DB_ID,
        },
      },
    });
    console.log(
      `🧹 Cleared ${deletedDistricts.count} existing Turkey districts`
    );

    // Türkiye'deki tüm şehirleri çek
    const turkeyCities = await prisma.city.findMany({
      where: { countryId: TURKEY_DB_ID },
      orderBy: { name: "asc" },
    });

    console.log(`✅ Found ${turkeyCities.length} cities in Turkey`);

    if (turkeyCities.length === 0) {
      console.warn(
        "⚠️ No cities found for Turkey. Please run full seed first (Option 1)."
      );
      return;
    }

    let totalDistrictsCreated = 0;
    let failedCities = 0;
    let successfulCities = 0;

    for (const city of turkeyCities) {
      try {
        console.log(`\n🏙️ Processing: ${city.name}`);

        const districtQuery = {
          query: `{
            listDistrict(cityId: { eq: "${city.id}" }) {
              id
              countryId
              stateId
              cityId
              name
              order
            }
          }`,
        };

        const response = await fetch(
          "https://api.myikas.com/api/v1/admin/graphql",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(districtQuery),
          }
        );

        if (!response.ok) {
          console.error(
            `   ❌ Failed to fetch districts. Status: ${response.status}`
          );
          failedCities++;
          continue;
        }

        const districtData = (await response.json()) as {
          data: {
            listDistrict: Array<{
              id: string;
              countryId: string;
              stateId: string;
              cityId: string;
              name: string;
              order: number;
            }>;
          };
        };

        if (!districtData.data || !districtData.data.listDistrict) {
          console.warn(`   ⚠️ No district data found`);
          continue;
        }

        const districts = districtData.data.listDistrict;

        if (districts.length === 0) {
          console.log(`   ℹ️ No districts to create`);
          continue;
        }

        // District'leri sırala ve database formatına çevir
        const createManyDistrict: Prisma.DistrictCreateManyInput[] = districts
          .sort((a, b) => a.order - b.order)
          .map((district) => ({
            id: district.id,
            name: district.name,
            cityId: city.id,
          }));

        // District'leri toplu olarak oluştur
        const result = await prisma.district.createMany({
          data: createManyDistrict,
          skipDuplicates: true,
        });

        totalDistrictsCreated += result.count;
        successfulCities++;
        console.log(`   ✅ Created ${result.count} districts`);
      } catch (cityError) {
        console.error(`   ❌ Error:`, cityError);
        failedCities++;
        continue;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Turkey districts seed completed!");
    console.log(`   Total cities: ${turkeyCities.length}`);
    console.log(`   Successful: ${successfulCities}`);
    console.log(`   Failed: ${failedCities}`);
    console.log(`   Total districts created: ${totalDistrictsCreated}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Fatal error in seedTurkeyDistricts:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🌍 LOCATION DATA SEEDER");
    console.log("=".repeat(60));
    console.log("\nSelect an option:");
    console.log("  1️⃣  - Full seed (Clear all data and import everything)");
    console.log("  2️⃣  - Seed Turkey districts only");
    console.log("  3️⃣  - Full seed + Turkey districts");
    console.log("  0️⃣  - Exit");
    console.log("=".repeat(60));

    const answer = await promptUser("\n👉 Enter your choice (0-3): ");

    switch (answer) {
      case "1":
        console.log("\n🚀 Starting full seed...");
        await fetchCountries();
        console.log("\n✅ Full seed completed!");
        break;

      case "2":
        console.log("\n🚀 Starting Turkey districts seed...");
        await seedTurkeyDistricts();
        console.log("\n✅ Turkey districts seed completed!");
        break;

      case "3":
        console.log("\n🚀 Starting full seed + Turkey districts...");
        await fetchCountries();
        console.log("\n📍 Now seeding Turkey districts...");
        await seedTurkeyDistricts();
        console.log("\n✅ All operations completed!");
        break;

      case "0":
        console.log("\n👋 Exiting...");
        break;

      default:
        console.log("\n❌ Invalid option. Please run the script again.");
        break;
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    throw error;
  }
}

// Script'i çalıştır
main()
  .then(() => {
    console.log("\n🎉 Seed script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    console.log("\n🔌 Disconnecting from database...");
    await prisma.$disconnect();
  });

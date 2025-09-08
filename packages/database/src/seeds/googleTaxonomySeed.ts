import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

interface CountryData {
  id: string;
  name: string;
  locationTranslations: {
    tr: string;
    en: string;
  };
  iso2: string;
  iso3: string;
  phoneCode: string;
  capital: string;
  currency: string;
  native: string;
  region: string;
  subregion: string;
  emoji: string;
  emojiString: string;
}

interface StateData {
  id: string;
  name: string;
  stateCode: string;
  countryId: string;
}

async function fetchCountries() {
  try {
    // Mevcut verileri temizle
    await prisma.stateTranslation.deleteMany();
    await prisma.state.deleteMany();
    await prisma.countryTranslation.deleteMany();
    await prisma.country.deleteMany();

    console.log("Ülke verileri çekiliyor...");

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

    const countryResponse = await fetch(
      "https://api.myikas.com/api/v1/admin/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(countryQuery),
      }
    );

    if (!countryResponse.ok) {
      throw new Error(`HTTP error! status: ${countryResponse.status}`);
    }

    const countryData = (await countryResponse.json()) as {
      data: {
        listCountry: CountryData[];
      };
    };

    const countries = countryData.data.listCountry;
    console.log(`${countries.length} ülke bulundu, kaydediliyor...`);

    // Ülkeleri kaydet
    for (const countryData of countries) {
      await prisma.country.create({
        data: {
          id: countryData.id,
          name: countryData.name,
          iso2: countryData.iso2 || null,
          iso3: countryData.iso3 || null,
          phoneCode: countryData.phoneCode || null,
          capital: countryData.capital || null,
          currency: countryData.currency || null,
          native: countryData.native || null,
          region: countryData.region || null,
          subregion: countryData.subregion || null,
          emoji: countryData.emoji || null,
          translations: {
            create: [
              {
                locale: "TR",
                name: countryData.locationTranslations.tr,
              },
              {
                locale: "EN",
                name: countryData.locationTranslations.en,
              },
            ],
          },
        },
      });
    }

    console.log(`${countries.length} ülke başarıyla kaydedildi.`);

    await fetchStatesForAllCountries(countries);

    console.log("Tüm veriler başarıyla kaydedildi.");
  } catch (error) {
    console.error("Veriler kaydedilirken hata oluştu:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function fetchStatesForAllCountries(countries: CountryData[]) {
  console.log("State verileri çekiliyor...");

  let totalStates = 0;

  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    console.log(
      `State'ler çekiliyor: ${country.name} (${i + 1}/${countries.length})`
    );

    try {
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
        console.warn(
          `${country.name} için state verileri alınamadı: ${stateResponse.status}`
        );
        continue;
      }

      const stateData = (await stateResponse.json()) as {
        data: {
          listState: StateData[];
        };
      };

      const states = stateData.data.listState;

      if (states && states.length > 0) {
        console.log(`  ${country.name}: ${states.length} state bulundu`);

        // State'leri kaydet
        for (const state of states) {
          await prisma.state.create({
            data: {
              id: state.id,
              name: state.name,
              stateCode: state.stateCode || null,
              countryId: state.countryId,
              translations: {
                create: [
                  {
                    locale: "TR",
                    name: state.name, // TR çevirisi yoksa aynı ismi kullan
                  },
                  {
                    locale: "EN",
                    name: state.name, // EN çevirisi yoksa aynı ismi kullan
                  },
                ],
              },
            },
          });
        }

        totalStates += states.length;
      } else {
        console.log(`  ${country.name}: State bulunamadı`);
      }

      // Rate limiting için kısa bekleme
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`${country.name} için state'ler alınırken hata:`, error);
      continue; // Bir ülke başarısız olsa bile diğerlerine devam et
    }
  }

  console.log(`Toplam ${totalStates} state kaydedildi.`);
}

fetchCountries()
  .then(() => {
    console.log("İşlem tamamlandı.");
  })
  .catch((error) => {
    console.error("İşlem başarısız:", error);
  });

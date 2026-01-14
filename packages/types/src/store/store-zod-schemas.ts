import { RoutingStrategy } from "@repo/database/client";
import { z } from "zod";
import { currencySchema, localeSchema } from "../common";

export const RoutingStrategySchema = z.enum(RoutingStrategy, {
  error: "Geçersiz yönlendirme stratejisi",
});
const strictDomainSchema = z
  .string({ error: " Alan adı zorunludur" })
  .trim()
  .toLowerCase()
  .check(({ issues, value }) => {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      issues.push({
        code: "custom",
        input: [],
        message:
          "Lütfen 'http://' veya 'https://' yazmadan sadece alan adını giriniz.",
      });
      return;
    }

    if (value.startsWith("www.")) {
      issues.push({
        code: "custom",
        input: [],
        message: "Lütfen başında 'www.' olmadan giriniz.",
      });
      return;
    }

    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/;
    if (!domainRegex.test(value)) {
      issues.push({
        code: "custom",
        input: [],
        message: "Geçerli bir alan adı giriniz (Örn: wellnessclubbyoyku.com).",
      });
    }
  });

export const LocaleCurrencyMapSchema = z.object({
  locale: localeSchema,
  currency: currencySchema,
});

export const StoreZodSchema = z
  .object({
    name: z
      .string({ message: "Mağaza adı zorunludur" })
      .min(2, "Mağaza adı en az 2 karakter olmalı"),

    isB2CActive: z.boolean().default(true),
    b2cCustomDomain: strictDomainSchema.nullish(),
    b2cRouting: RoutingStrategySchema.default("PATH_PREFIX"),
    b2cDefaultLocale: localeSchema,
    b2cLocaleCurrencies: z
      .array(LocaleCurrencyMapSchema)
      .min(1, "B2C için en az bir dil tanımlanmalı"),

    isB2BActive: z.boolean().default(false),

    b2bSubdomain: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        "Subdomain sadece küçük harf, rakam ve tire içerebilir"
      )
      .min(2, "Subdomain en az 2 karakter olmalı")
      .optional()
      .nullable(),

    b2bCustomDomain: strictDomainSchema.nullish(),

    b2bRouting: RoutingStrategySchema.default("PATH_PREFIX"),
    b2bDefaultLocale: localeSchema,
    b2bLocaleCurrencies: z
      .array(LocaleCurrencyMapSchema)
      .min(1, "B2B için en az bir dil tanımlanmalı"),
  })
  .check(({ value, issues }) => {
    if (value.isB2BActive) {
      if (!value.b2bSubdomain && !value.b2bCustomDomain) {
        issues.push({
          code: "custom",
          input: ["b2bSubdomain"],
          message:
            "B2B aktifse bir subdomain veya özel alan adı belirlemelisiniz.",
        });
      }

      if (value.b2bSubdomain && !value.b2bCustomDomain) {
        if (value.b2bRouting === "SUBDOMAIN") {
          issues.push({
            code: "custom",
            input: ["b2bRouting"],
            message:
              "Platform subdomain kullanırken dil ayrımı için 'Subdomain' stratejisi kullanılamaz. Lütfen 'Path Prefix' seçiniz.",
          });
        }
      }
      if (value.b2bCustomDomain && value.b2bRouting === "SUBDOMAIN") {
        const parts = value.b2bCustomDomain.split(".");

        if (parts.length > 2) {
          issues.push({
            code: "custom",
            input: ["b2bRouting"],
            path: ["b2bRouting"],
            message: `"${value.b2bCustomDomain}" zaten bir subdomain. Dil ayrımı için 'Subdomain' stratejisi kullanılamaz (SSL sorunu oluşur). Lütfen 'Path Prefix' seçiniz.`,
          });
        }
      }
    }

    if (value.isB2CActive && value.isB2BActive) {
      if (
        value.b2cCustomDomain &&
        value.b2bCustomDomain &&
        value.b2cCustomDomain.toLowerCase() ===
          value.b2bCustomDomain.toLowerCase()
      ) {
        issues.push({
          code: "custom",
          input: ["b2bCustomDomain"],
          message: "B2C ve B2B aynı özel alan adını kullanamaz.",
        });
      }

      if (value.b2cRouting === "SUBDOMAIN" && value.b2bSubdomain) {
        const b2cLocales = value.b2cLocaleCurrencies.map((l) =>
          l.locale.toLowerCase()
        );
        if (b2cLocales.includes(value.b2bSubdomain.toLowerCase())) {
          issues.push({
            code: "custom",
            input: ["b2bSubdomain"],
            message: `"${value.b2bSubdomain}" subdomain'i B2C dil kodlarından biriyle çakışıyor. Farklı bir subdomain seçiniz.`,
          });
        }
      }

      if (value.b2cCustomDomain && value.b2bCustomDomain) {
        const extractBaseDomain = (domain: string) => {
          const parts = domain.toLowerCase().split(".");
          if (parts.length >= 2) {
            return parts.slice(-2).join(".");
          }
          return domain.toLowerCase();
        };

        const b2cBase = extractBaseDomain(value.b2cCustomDomain);
        const b2bBase = extractBaseDomain(value.b2bCustomDomain);

        if (b2cBase === b2bBase) {
          const b2cSubdomain = value.b2cCustomDomain
            .toLowerCase()
            .replace(`.${b2cBase}`, "");
          const b2bSubdomain = value.b2bCustomDomain
            .toLowerCase()
            .replace(`.${b2bBase}`, "");

          if (value.b2cRouting === "SUBDOMAIN") {
            const b2cLocales = value.b2cLocaleCurrencies.map((l) =>
              l.locale.toLowerCase()
            );
            if (b2cLocales.includes(b2bSubdomain)) {
              issues.push({
                code: "custom",
                input: ["b2bCustomDomain"],
                message: `B2B alan adının subdomain kısmı (${b2bSubdomain}) B2C dil kodlarından biriyle çakışıyor.`,
              });
            }
          }

          if (value.b2bRouting === "SUBDOMAIN") {
            const b2bLocales = value.b2bLocaleCurrencies.map((l) =>
              l.locale.toLowerCase()
            );
            if (b2bLocales.includes(b2cSubdomain)) {
              issues.push({
                code: "custom",
                input: ["b2cCustomDomain"],
                message: `B2C alan adının subdomain kısmı (${b2cSubdomain}) B2B dil kodlarından biriyle çakışıyor.`,
              });
            }
          }
        }
      }

      if (
        value.b2cCustomDomain &&
        value.b2cRouting === "SUBDOMAIN" &&
        value.b2bSubdomain &&
        !value.b2bCustomDomain
      ) {
        const b2cLocales = value.b2cLocaleCurrencies.map((l) =>
          l.locale.toLowerCase()
        );
        if (b2cLocales.includes(value.b2bSubdomain.toLowerCase())) {
          issues.push({
            code: "custom",
            input: ["b2bSubdomain"],
            message: `Platform subdomain'i (${value.b2bSubdomain}) B2C dil kodlarından biriyle çakışıyor.`,
          });
        }
      }
    }

    const checkDuplicateLocales = (
      items: typeof value.b2cLocaleCurrencies,
      input: "b2cLocaleCurrencies" | "b2bLocaleCurrencies"
    ) => {
      const locales = items.map((i) => i.locale);
      const duplicates = locales.filter(
        (locale, index) => locales.indexOf(locale) !== index
      );
      if (duplicates.length > 0) {
        issues.push({
          code: "custom",
          input: [input],
          message: `Aynı dil birden fazla kez eklenemez: ${duplicates.join(", ")}`,
        });
      }
    };

    if (value.b2cLocaleCurrencies?.length > 0) {
      checkDuplicateLocales(value.b2cLocaleCurrencies, "b2cLocaleCurrencies");
    }
    if (value.b2bLocaleCurrencies?.length > 0) {
      checkDuplicateLocales(value.b2bLocaleCurrencies, "b2bLocaleCurrencies");
    }

    if (value.isB2CActive) {
      const b2cLocales = value.b2cLocaleCurrencies.map((l) => l.locale);
      if (!b2cLocales.includes(value.b2cDefaultLocale)) {
        issues.push({
          code: "custom",
          input: ["b2cDefaultLocale"],
          message: "Varsayılan dil, tanımlı diller arasında olmalıdır.",
        });
      }
    }

    if (value.isB2BActive) {
      const b2bLocales = value.b2bLocaleCurrencies.map((l) => l.locale);
      if (!b2bLocales.includes(value.b2bDefaultLocale)) {
        issues.push({
          code: "custom",
          input: ["b2bDefaultLocale"],
          message: "Varsayılan dil, tanımlı diller arasında olmalıdır.",
        });
      }
    }
  });

export type StoreZodInputType = z.input<typeof StoreZodSchema>;
export type StoreZodOutputType = z.output<typeof StoreZodSchema>;

# B2C E-Commerce - Yapılacaklar Listesi

Bu dosya, projede yapılması gereken refaktörler ve iyileştirmeler için bir takip listesidir.

---

### Admin Inputs Taşıma

`app/components/inputs/admin/` → `app/(admin)/components/form/`

| Mevcut İsim                            | Yeni İsim                | Durum |
| -------------------------------------- | ------------------------ | ----- |
| `AdminBrandDataSelect.tsx`             | `BrandSelect.tsx`        | [ ]   |
| `AdminCategoryDataSelect.tsx`          | `CategorySelect.tsx`     | [ ]   |
| `AdminTagDataSelect.tsx`               | `TagSelect.tsx`          | [ ]   |
| `AdminInventoryLocationTypeSelect.tsx` | `LocationTypeSelect.tsx` | [ ]   |

## 🟡 Klasör Organizasyonu

### Admin Theme Builder Taşıma

```bash
# React Flow components (admin theme builder için)
app/components/react-flow/ → app/(admin)/components/theme-builder/
```

| Görev                        | Durum |
| ---------------------------- | ----- |
| `react-flow/` klasörünü taşı | [ ]   |
| Import path'lerini güncelle  | [ ]   |
| Test et                      | [ ]   |

### Store Components Taşıma

```bash
# Store theme components
app/components/pages/store-components/ → app/(admin)/admin/(theme)/components/
```

| Görev                              | Durum |
| ---------------------------------- | ----- |
| `store-components/` klasörünü taşı | [ ]   |
| Import path'lerini güncelle        | [ ]   |
| Test et                            | [ ]   |

---

## 🟢 Gelecek Özellikler

| Özellik                           | Öncelik | Durum |
| --------------------------------- | ------- | ----- |
| React Native app (`apps/mobile/`) | Düşük   | [ ]   |
| GraphQL desteği                   | Düşük   | [ ]   |
| Unit test coverage artırma        | Orta    | [ ]   |
| E2E test ekleme                   | Orta    | [ ]   |

---

## 📝 Notlar

- Her refaktör sonrası `turbo run check-types` ve `turbo run lint` çalıştır
- Import path'lerini güncellerken IDE'nin otomatik refaktör özelliğini kullan
- Büyük refaktörler için ayrı branch aç

---

_Son güncelleme: 2026-01-17_

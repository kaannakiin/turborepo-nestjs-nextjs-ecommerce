import { PrismaClient } from "../../generated/prisma";
import * as readline from "readline";

const prisma = new PrismaClient();

// Readline interface oluştur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Soru sorma fonksiyonu
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Sadece Cart verilerini sil
async function deleteCartData() {
  console.log("\n🗑️ Cart verilerini temizleme işlemi başlatılıyor...\n");

  try {
    await prisma.$transaction(async (tx) => {
      const deletedCartItems = await tx.cartItem.deleteMany({});
      console.log(`✅ ${deletedCartItems.count} adet CartItem silindi`);

      const deletedCarts = await tx.cart.deleteMany({});
      console.log(`✅ ${deletedCarts.count} adet Cart silindi`);

      console.log("\n✨ Cart verileri başarıyla temizlendi!");
    });
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    throw error;
  }
}

// Terk edilmiş sepetleri sil
async function deleteAbandonedCarts() {
  console.log("\n🗑️ Terk edilmiş sepetleri temizleme işlemi başlatılıyor...\n");

  try {
    await prisma.$transaction(async (tx) => {
      // Önce terk edilmiş sepetlerin item'larını sil
      const abandonedCarts = await tx.cart.findMany({
        where: { status: "ABANDONED" },
        select: { id: true },
      });

      const cartIds = abandonedCarts.map((cart) => cart.id);

      const deletedCartItems = await tx.cartItem.deleteMany({
        where: { cartId: { in: cartIds } },
      });
      console.log(`✅ ${deletedCartItems.count} adet CartItem silindi`);

      const deletedCarts = await tx.cart.deleteMany({
        where: { status: "ABANDONED" },
      });
      console.log(`✅ ${deletedCarts.count} adet terk edilmiş Cart silindi`);

      console.log("\n✨ Terk edilmiş sepetler başarıyla temizlendi!");
    });
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    throw error;
  }
}

// Ana menü
async function showMenu() {
  console.clear();
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║          🗃️  VERİTABANI TEMİZLEME ARACI 🗃️            ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  console.log("Lütfen yapmak istediğiniz işlemi seçin:\n");
  console.log("1️⃣  - Tüm Cart ve Order verilerini sil");
  console.log("2️⃣  - Sadece Cart verilerini sil");
  console.log("3️⃣  - Sadece Order verilerini sil");
  console.log("4️⃣  - Terk edilmiş sepetleri sil (ABANDONED)");
  console.log("0️⃣  - Çıkış\n");

  const choice = await askQuestion("Seçiminiz (0-4): ");
  return choice.trim();
}

// Onay sor
async function confirmAction(action: string): Promise<boolean> {
  const answer = await askQuestion(
    `\n⚠️  ${action} işlemi yapılacak! Emin misiniz? (evet/hayir): `
  );
  return answer.toLowerCase() === "evet";
}

// Ana fonksiyon
async function main() {
  try {
    while (true) {
      const choice = await showMenu();

      switch (choice) {
        case "1":
          if (await confirmAction("TÜM Cart ve Order verilerini silme")) {
            await askQuestion("\nDevam etmek için Enter'a basın...");
          } else {
            console.log("❌ İşlem iptal edildi");
            await askQuestion("\nDevam etmek için Enter'a basın...");
          }
          break;

        case "2":
          if (await confirmAction("Cart verilerini silme")) {
            await deleteCartData();
            await askQuestion("\nDevam etmek için Enter'a basın...");
          } else {
            console.log("❌ İşlem iptal edildi");
            await askQuestion("\nDevam etmek için Enter'a basın...");
          }
          break;

        case "3":
          if (await confirmAction("Order verilerini silme")) {
            await askQuestion("\nDevam etmek için Enter'a basın...");
          } else {
            console.log("❌ İşlem iptal edildi");
            await askQuestion("\nDevam etmek için Enter'a basın...");
          }
          break;

        case "4":
          if (await confirmAction("Terk edilmiş sepetleri silme")) {
            await deleteAbandonedCarts();
            await askQuestion("\nDevam etmek için Enter'a basın...");
          } else {
            console.log("❌ İşlem iptal edildi");
            await askQuestion("\nDevam etmek için Enter'a basın...");
          }
          break;

        case "0":
          console.log("\n👋 Çıkış yapılıyor...");
          rl.close();
          await prisma.$disconnect();
          process.exit(0);
          break;

        default:
          console.log(
            "\n❌ Geçersiz seçim! Lütfen 0-4 arasında bir sayı girin."
          );
          await askQuestion("\nDevam etmek için Enter'a basın...");
      }
    }
  } catch (error) {
    console.error("❌ Beklenmeyen hata:", error);
    rl.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Scripti başlat
main();

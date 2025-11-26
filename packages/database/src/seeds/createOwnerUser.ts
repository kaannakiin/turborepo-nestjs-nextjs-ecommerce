import { hash } from "argon2";
import * as readline from "readline";
import { prisma } from "..";

// Terminal input interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promise wrapper for readline question
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Turkish format)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Password validation
function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

async function createOwnerUser() {
  try {
    console.log("🚀 Yeni Owner Kullanıcısı Oluşturma\n");

    // Get user inputs
    const firstName = await askQuestion("İsim: ");
    if (!firstName) {
      console.error("❌ İsim boş olamaz!");
      process.exit(1);
    }

    const lastName = await askQuestion("Soyisim: ");
    if (!lastName) {
      console.error("❌ Soyisim boş olamaz!");
      process.exit(1);
    }

    let email: string;
    do {
      email = await askQuestion("Email: ");
      if (!isValidEmail(email)) {
        console.error("❌ Geçerli bir email adresi girin!");
      }
    } while (!isValidEmail(email));

    let phone: string;
    do {
      phone = await askQuestion("Telefon (5xxxxxxxxx): ");
      if (!isValidPhone(phone)) {
        console.error(
          "❌ Geçerli bir telefon numarası girin! (örn: 5551234567)"
        );
      }
    } while (!isValidPhone(phone));

    let password: string;
    do {
      password = await askQuestion("Şifre (min 6 karakter): ");
      if (!isValidPassword(password)) {
        console.error("❌ Şifre en az 6 karakter olmalı!");
      }
    } while (!isValidPassword(password));

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone.replace(/\s/g, "") }],
      },
    });

    if (existingUser) {
      console.error(
        "❌ Bu email veya telefon numarası ile kayıtlı kullanıcı zaten mevcut!"
      );
      process.exit(1);
    }

    const hashedPassword = await hash(password);

    // Format phone number
    const formattedPhone = phone.replace(/\s/g, "").replace(/^0/, "");

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: firstName,
        surname: lastName,
        email,
        phone: `${formattedPhone.startsWith("+90") ? formattedPhone : "+90"}${formattedPhone}`,
        password: hashedPassword,
        role: "OWNER", // assuming you have role field
      },
    });

    console.log("\n✅ Owner kullanıcısı başarıyla oluşturuldu!");
    console.log("📋 Kullanıcı Bilgileri:");
    console.log(`   ID: ${newUser.id}`);
    console.log(`   İsim: ${newUser.name} ${newUser.surname}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Telefon: ${newUser.phone}`);
    console.log(`   Rol: ${newUser.role || "OWNER"}`);
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the function
createOwnerUser();

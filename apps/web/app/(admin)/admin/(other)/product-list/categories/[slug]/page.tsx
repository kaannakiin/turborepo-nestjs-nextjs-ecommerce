import { cookies } from "next/headers";
import { Params } from "../../../../../../types/GlobalTypes";
import AdminCategoryForm from "../components/AdminCategoryForm";

const AdminCategoriesFormPage = async ({ params }: { params: Params }) => {
  const { slug } = await params;

  if (slug === "new") {
    return <AdminCategoryForm />;
  } else {
    try {
      const cookieStore = await cookies();
      const categoryResponse = await fetch(
        `${process.env.BACKEND_URL}/admin/products/categories/get-category/${slug}`,
        {
          method: "GET",
          headers: {
            Cookie: `token=${cookieStore.get("token")?.value || ""}`,
          },
          credentials: "include",
          cache: "no-cache",
        }
      );

      if (!categoryResponse.ok) {
        // Kategori bulunamadı veya başka bir hata
        return (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Kategori Yüklenirken Hata Oluştu
              </h2>
              <p className="text-gray-500">
                Kategori bulunamadı veya erişim izniniz yok.
              </p>
            </div>
          </div>
        );
      }

      const categoryData = await categoryResponse.json();

      return <AdminCategoryForm defaultValues={categoryData} />;
    } catch (error) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Kategori Yüklenirken Hata Oluştu
            </h2>
            <p className="text-gray-500">
              Bağlantı hatası. Lütfen sayfayı yenileyin.
            </p>
          </div>
        </div>
      );
    }
  }
};

export default AdminCategoriesFormPage;

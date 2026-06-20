import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Cổng cho các công cụ dành cho HỌC VIÊN ĐÃ ĐĂNG KÝ TÀI KHOẢN (sản phẩm phễu).
 * Chỉ yêu cầu đăng nhập — không cần mua gói nào.
 *
 *   - Chưa đăng nhập → redirect sang /register?next=/oto (vào phễu: đăng ký
 *                       xong dẫn ra trang OTO để xem offer Blueprint)
 *   - Đã đăng nhập   → trả về null (trang tự render công cụ — học viên dùng được)
 *
 * Cách dùng trong page.tsx:
 *   const gate = await memberToolGate();
 *   if (gate) return gate;
 */
export async function memberToolGate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/register?next=%2Foto");
  }

  return null;
}

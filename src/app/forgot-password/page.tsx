import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Quên mật khẩu — ${siteConfig.name}`,
  description: `Khôi phục mật khẩu tài khoản ${siteConfig.name}.`,
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at top, #0d1a12 0%, #0a0a0a 60%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/images/about/portrait.jpg" alt={siteConfig.name} width={56} height={56} sizes="56px" className="w-14 h-14 rounded-2xl mb-4 object-cover inline-block" />
          <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        <div className="card-dark p-6 sm:p-8">
          {/* Forgot Password Form with Turnstile */}
          <ForgotPasswordForm />

          <p className="text-center text-sm text-gray-500 mt-5">
            Nhớ mật khẩu rồi?{" "}
            <Link href="/login" className="text-[#2563EB] font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

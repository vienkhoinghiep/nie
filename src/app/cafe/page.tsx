import type { Metadata } from "next";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import CafeLanding from "./CafeLanding";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Mời Cafe 99K — Nhận 100 Mô Hình Kinh Doanh Triệu Đô | ${siteConfig.shortName}`,
  description:
    "Mỗi ly cafe 99K, đội ngũ VINEN gửi tặng bạn tài liệu 100 mô hình kinh doanh sản phẩm số doanh thu 1 triệu đô la trên thế giới, ứng dụng cho Việt Nam.",
  alternates: {
    canonical: `${BASE_URL}/cafe`,
  },
  openGraph: {
    title: "Mời Cafe 99K — Nhận 100 Mô Hình Kinh Doanh Triệu Đô",
    description:
      "Tài liệu nghiên cứu 100 mô hình kinh doanh sản phẩm số từ những cá nhân doanh thu 1 triệu đô la — đã được phân tích & bản địa hóa để ứng dụng ngay tại Việt Nam.",
    type: "website",
    url: `${BASE_URL}/cafe`,
    images: [
      {
        url: `${BASE_URL}/cafe.jpg`,
        width: 1200,
        height: 630,
        alt: "Mời Cafe 99K — Nhận 100 Mô Hình Kinh Doanh Triệu Đô",
      },
    ],
  },
};

export default function CafePage() {
  return <CafeLanding />;
}

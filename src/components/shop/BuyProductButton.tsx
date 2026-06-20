"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import CheckoutModal from "@/components/checkout/CheckoutModal";

interface BuyProductButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  isAuthenticated: boolean;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}

export default function BuyProductButton({
  product,
  isAuthenticated,
  className,
  label,
  style,
}: BuyProductButtonProps) {
  const [open, setOpen] = useState(false);
  const isFree = product.price === 0;

  const handleClick = () => {
    if (!isAuthenticated) {
      const next = encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/");
      window.location.href = `/register?next=${next}`;
      return;
    }
    setOpen(true);
  };

  const defaultLabel = isFree
    ? "Nhận miễn phí"
    : isAuthenticated
      ? `Mua ngay — ${product.price.toLocaleString("vi-VN")}₫`
      : "Đăng ký & Thanh toán";

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.99]"
        }
        style={style ?? (className ? undefined : { background: "#2563EB" })}
      >
        <ShoppingCart size={16} />
        {label ?? defaultLabel}
      </button>

      {open && (
        <CheckoutModal
          product={product}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            // Stay on page; modal shows success state. User can navigate away.
          }}
        />
      )}
    </>
  );
}

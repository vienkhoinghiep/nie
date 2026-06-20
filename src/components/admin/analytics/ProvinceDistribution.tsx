"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface ProvinceRow {
  province: string;
  count: number;
}
interface ProvinceData {
  total: number;
  known: number;
  unknown: number;
  provinces: ProvinceRow[];
}

const TOP = 12;

export default function ProvinceDistribution() {
  const [data, setData] = useState<ProvinceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics/provinces");
        if (res.ok && active) setData(await res.json());
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const provinces = data?.provinces ?? [];
  const max = Math.max(1, ...provinces.map((p) => p.count));
  const top = provinces.slice(0, TOP);

  return (
    <div className="card-dark p-5">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={16} className="text-[#06b6d4]" />
        <h3 className="font-semibold text-white text-sm">
          Phân bổ khách hàng theo tỉnh
        </h3>
        {data && (
          <span className="ml-auto text-[11px] text-gray-500">
            {data.known}/{data.total} có vị trí
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-500 mb-4">
        Suy ra tự động từ IP lúc đăng ký
      </p>

      {loading ? (
        <div className="text-sm text-gray-500 py-10 text-center">Đang tải…</div>
      ) : top.length === 0 ? (
        <div className="text-sm text-gray-500 py-10 text-center leading-relaxed">
          Chưa có dữ liệu vị trí. Số liệu sẽ xuất hiện khi có khách đăng ký mới
          trên production (Vercel cung cấp vị trí theo IP).
        </div>
      ) : (
        <div className="space-y-2.5">
          {top.map((p, i) => {
            const pct =
              data && data.known > 0
                ? Math.round((p.count / data.known) * 100)
                : 0;
            return (
              <div key={p.province} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-300 min-w-0">
                    <span className="w-4 text-gray-600 text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{p.province}</span>
                  </span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    <span className="text-white font-semibold">{p.count}</span> ·{" "}
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-[#1a1a1a]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((p.count / max) * 100, 4)}%`,
                      background: "#06b6d4",
                    }}
                  />
                </div>
              </div>
            );
          })}
          {provinces.length > TOP && (
            <p className="text-[11px] text-gray-500 pt-1">
              +{provinces.length - TOP} tỉnh/thành khác
            </p>
          )}
        </div>
      )}
    </div>
  );
}

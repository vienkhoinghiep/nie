"use client";

import { CheckCircle2 } from "lucide-react";
import type {
  Gender,
  MaritalStatus,
  ProfileData,
} from "@/lib/blueprint/types";

const BRAND = "#2563EB";
const BLUE = "#3b82f6";

interface Props {
  data: ProfileData;
  onChange: (next: ProfileData) => void;
  onComplete: () => void;
}

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const MARITALS: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "Độc thân" },
  { value: "married", label: "Đã kết hôn" },
  { value: "divorced", label: "Đã ly hôn" },
  { value: "widowed", label: "Goá" },
];

export default function ProfileSection({ data, onChange, onComplete }: Props) {
  const set = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    onChange({ ...data, [key]: value });
  };

  // Ngày sinh: lưu ISO "YYYY-MM-DD" + tự suy ra năm sinh để tính tuổi.
  const setBirthDate = (v: string) => {
    const yr = v ? parseInt(v.slice(0, 4), 10) : NaN;
    onChange({
      ...data,
      birthDate: v || undefined,
      birthYear: Number.isFinite(yr) ? yr : undefined,
    });
  };

  // Field-level helper: completion check
  const isComplete =
    !!data.fullName &&
    !!(data.birthDate || data.birthYear) &&
    !!data.gender &&
    !!data.maritalStatus &&
    !!data.city;

  return (
    <div className="space-y-4">
      {/* Profile group */}
      <Group label="Thông tin cá nhân" color={BLUE}>
        <div className="grid sm:grid-cols-2 gap-3">
          <TextField
            label="Họ và tên"
            value={data.fullName ?? ""}
            onChange={(v) => set("fullName", v)}
            placeholder="Nguyễn Văn A"
          />
          <DateField
            label="Ngày sinh"
            value={data.birthDate ?? ""}
            onChange={setBirthDate}
          />
          <SelectField
            label="Giới tính"
            value={data.gender ?? ""}
            options={GENDERS}
            onChange={(v) => set("gender", v as Gender)}
          />
          <SelectField
            label="Tình trạng hôn nhân"
            value={data.maritalStatus ?? ""}
            options={MARITALS}
            onChange={(v) => set("maritalStatus", v as MaritalStatus)}
          />
          <NumField
            label="Số con"
            value={data.children}
            onChange={(v) => set("children", v)}
            placeholder="0"
            min={0}
            max={20}
          />
          <TextField
            label="Tỉnh / thành phố"
            value={data.city ?? ""}
            onChange={(v) => set("city", v)}
            placeholder="Hà Nội"
          />
        </div>
      </Group>

      {/* CTA */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="text-[11px] text-gray-500">
          {isComplete
            ? "✓ Đã đủ thông tin tối thiểu — có thể chuyển sang Phần 2."
            : "Điền các trường còn thiếu để hoàn thành phần này."}
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={!isComplete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
          style={{
            background: isComplete
              ? `linear-gradient(135deg, #3B82F6, ${BRAND})`
              : "#1a1a1a",
            color: isComplete ? "#0a0a0a" : "#555",
            cursor: isComplete ? "pointer" : "not-allowed",
            border: isComplete ? "none" : "1px solid #2a2a2a",
            boxShadow: isComplete ? `0 6px 18px ${BRAND}55` : "none",
          }}
        >
          <CheckCircle2 size={14} />
          Hoàn thành · sang Phần II →
        </button>
      </div>
    </div>
  );
}

/* ─── primitives ─── */

function Group({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: `linear-gradient(135deg, ${color}08, transparent)`,
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10.5px] text-gray-400 mb-1 uppercase tracking-wider font-bold">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-2 rounded-md text-[13px] text-white outline-none"
        style={{
          background: "#0a0a0a",
          border: `1px solid ${value ? `${BRAND}55` : "#2a2a2a"}`,
        }}
      />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  const display = value === undefined || value === null ? "" : String(value);
  return (
    <div>
      <label className="block text-[10.5px] text-gray-400 mb-1 uppercase tracking-wider font-bold">
        {label}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          // CHO PHÉP gõ thoải mái — không clamp on-the-fly
          const cleaned = e.target.value.replace(/\D/g, "");
          if (cleaned === "") {
            onChange(undefined);
            return;
          }
          onChange(parseInt(cleaned, 10));
        }}
        onBlur={(e) => {
          // Clamp KHI BLUR — sau khi user nhập xong
          const cleaned = e.target.value.replace(/\D/g, "");
          if (cleaned === "") return;
          let n = parseInt(cleaned, 10);
          if (min !== undefined && n < min) n = min;
          if (max !== undefined && n > max) n = max;
          if (n !== value) onChange(n);
        }}
        placeholder={placeholder}
        className="w-full px-2.5 py-2 rounded-md text-[13px] text-white outline-none"
        style={{
          background: "#0a0a0a",
          border: `1px solid ${display ? `${BRAND}55` : "#2a2a2a"}`,
        }}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10.5px] text-gray-400 mb-1 uppercase tracking-wider font-bold">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 rounded-md text-[13px] text-white outline-none"
        style={{
          background: "#0a0a0a",
          border: `1px solid ${value ? `${BRAND}55` : "#2a2a2a"}`,
        }}
      >
        <option value="">— Chọn —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <label className="block text-[10.5px] text-gray-400 mb-1 uppercase tracking-wider font-bold">
        {label}
      </label>
      <input
        type="date"
        value={value}
        max={today}
        min="1900-01-01"
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 rounded-md text-[13px] text-white outline-none"
        style={{
          background: "#0a0a0a",
          border: `1px solid ${value ? `${BRAND}55` : "#2a2a2a"}`,
          colorScheme: "dark",
        }}
      />
    </div>
  );
}

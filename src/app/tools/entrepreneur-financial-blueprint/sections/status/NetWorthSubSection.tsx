"use client";

import { useMemo } from "react";
import {
  Banknote,
  PiggyBank,
  Gem,
  TrendingUp,
  Coins,
  Bitcoin,
  HandCoins,
  Building2,
  Home,
  Car,
  MoreHorizontal,
  CreditCard,
  Wallet,
  Building,
  Landmark,
  Map,
  Sparkles,
  Bike,
  Sofa,
  Cpu,
  Receipt,
  TreePine,
  ChartBar,
  Rocket,
  ScrollText,
  HandHeart,
  ShieldAlert,
  ShoppingCart,
  Smartphone,
  ChartLine,
} from "lucide-react";
import type {
  CashflowAssetStability,
  ConsumptionLoadLevel,
  CryptoExposure,
  DropReaction,
  EmergencyFundLevel,
  GrowthHoldingPeriod,
  GrowthLeverage,
  LiquidityAccess,
  NetWorthAssets,
  NetWorthData,
  NetWorthLiabilities,
  RateIncreaseAffordability,
  RateType,
  ReturnVsRate,
  DebtExitPlan,
} from "@/lib/blueprint/types";

const GREEN = "#22c55e";
const RED = "#ef4444";
const BRAND = "#2563EB";
const BLUE = "#3b82f6";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";

interface Props {
  data: NetWorthData;
  onChange: (next: NetWorthData) => void;
}

interface FieldDef<K> {
  key: K;
  label: string;
  icon: typeof Wallet;
  color: string;
}

/* ─── ASSET FIELDS (4 nhóm) ─── */

const LIQUID_FIELDS: FieldDef<keyof NetWorthAssets>[] = [
  { key: "cash",                    label: "Tiền mặt",                       icon: Banknote, color: GREEN },
  { key: "bankAccount",             label: "Tiền trong tài khoản NH",         icon: Landmark, color: GREEN },
  { key: "savings",                 label: "Sổ tiết kiệm CKH",                icon: PiggyBank, color: BLUE },
  { key: "gold",                    label: "Vàng vật chất",                   icon: Gem, color: AMBER },
  { key: "goldCertificate",         label: "Vàng tài khoản / chứng chỉ",      icon: Coins, color: AMBER },
  { key: "crypto",                  label: "Crypto (BTC, ETH, stable…)",      icon: Bitcoin, color: "#f97316" },
  { key: "moneyMarketFund",         label: "Quỹ tiền tệ / trái phiếu NH",     icon: ChartBar, color: CYAN },
  { key: "shortTermLoanReceivable", label: "Cho vay ngắn hạn thu được",       icon: HandCoins, color: CYAN },
  { key: "otherLiquid",             label: "TS thanh khoản khác",             icon: MoreHorizontal, color: "#888" },
];

const CONSUMPTION_FIELDS: FieldDef<keyof NetWorthAssets>[] = [
  { key: "primaryHome",       label: "Nhà đang ở",                      icon: Home, color: AMBER },
  { key: "familyLand",        label: "Đất/nhà gia đình (không cho thuê)", icon: Map, color: AMBER },
  { key: "car",               label: "Ô tô cá nhân",                    icon: Car, color: BLUE },
  { key: "motorbike",         label: "Xe máy",                          icon: Bike, color: BLUE },
  { key: "furniture",         label: "Nội thất + gia dụng",             icon: Sofa, color: PURPLE },
  { key: "jewelry",           label: "Trang sức cá nhân",               icon: Sparkles, color: AMBER },
  { key: "tech",              label: "Đồ công nghệ giá trị cao",         icon: Cpu, color: BLUE },
  { key: "otherConsumption",  label: "TS tiêu dùng khác",                icon: MoreHorizontal, color: "#888" },
];

const GROWTH_FIELDS: FieldDef<keyof NetWorthAssets>[] = [
  { key: "rawLand",            label: "Đất nền",                         icon: Map, color: AMBER },
  { key: "agriLand",           label: "Đất nông nghiệp",                 icon: TreePine, color: GREEN },
  { key: "individualStocks",   label: "Cổ phiếu riêng lẻ",                icon: TrendingUp, color: BLUE },
  { key: "equityFunds",        label: "Chứng chỉ quỹ cổ phiếu",          icon: ChartBar, color: PURPLE },
  { key: "etf",                label: "ETF",                              icon: ChartLine, color: PURPLE },
  { key: "privateEquity",      label: "Cổ phần DN chưa niêm yết",         icon: HandCoins, color: PURPLE },
  { key: "startup",            label: "Startup / VC",                     icon: Rocket, color: "#f97316" },
  { key: "propertyForGrowth",  label: "BĐS chờ tăng giá",                 icon: Building2, color: BRAND },
  { key: "otherGrowth",        label: "TS tăng trưởng khác",              icon: MoreHorizontal, color: "#888" },
];

const CASHFLOW_FIELDS: FieldDef<keyof NetWorthAssets>[] = [
  { key: "rentalProperty",   label: "BĐS cho thuê",                    icon: Building2, color: BRAND },
  { key: "bondsForCashflow", label: "Trái phiếu (giá trị)",            icon: Coins, color: CYAN },
  { key: "dividendStocks",   label: "Cổ phiếu cổ tức (giá trị)",        icon: ChartLine, color: GREEN },
  { key: "businessEquity",   label: "Vốn góp kinh doanh",               icon: HandHeart, color: BRAND },
  { key: "passiveSystem",    label: "Hệ thống thụ động",                icon: Sparkles, color: PURPLE },
  { key: "royaltyAsset",     label: "Tài sản sở hữu trí tuệ",           icon: ScrollText, color: PURPLE },
  { key: "lendingCapital",   label: "Vốn cho vay lấy lãi",              icon: HandCoins, color: CYAN },
  { key: "otherCashflow",    label: "TS dòng tiền khác",                icon: MoreHorizontal, color: "#888" },
];

/* ─── DEBT FIELDS (3 nhóm) ─── */

const CONSUMER_DEBT_FIELDS: FieldDef<keyof NetWorthLiabilities>[] = [
  { key: "creditCard",         label: "Nợ thẻ tín dụng",          icon: CreditCard, color: RED },
  { key: "personalLoan",       label: "Vay tiêu dùng cá nhân",     icon: Wallet, color: RED },
  { key: "installment",        label: "Mua hàng trả góp",          icon: ShoppingCart, color: RED },
  { key: "onlineLoan",         label: "Vay app / online",          icon: Smartphone, color: RED },
  { key: "familyLoanConsumer", label: "Vay người thân tiêu dùng",  icon: HandHeart, color: RED },
  { key: "otherConsumerDebt",  label: "Nợ tiêu dùng khác",         icon: MoreHorizontal, color: RED },
];

const HOME_CAR_DEBT_FIELDS: FieldDef<keyof NetWorthLiabilities>[] = [
  { key: "mortgage",        label: "Vay mua nhà để ở",        icon: Home, color: AMBER },
  { key: "homeRepair",      label: "Vay sửa nhà",             icon: Receipt, color: AMBER },
  { key: "carLoan",         label: "Vay mua ô tô",            icon: Car, color: AMBER },
  { key: "motorbikeLoan",   label: "Vay mua xe máy",          icon: Bike, color: AMBER },
  { key: "otherFamilyDebt", label: "Nợ khác phục vụ gia đình", icon: MoreHorizontal, color: AMBER },
];

const INVESTMENT_DEBT_FIELDS: FieldDef<keyof NetWorthLiabilities>[] = [
  { key: "investmentProperty",  label: "Vay mua BĐS đầu tư",       icon: Building2, color: PURPLE },
  { key: "investmentLand",      label: "Vay mua đất nền",          icon: Map, color: PURPLE },
  { key: "investmentStock",     label: "Vay đầu tư cổ phiếu",       icon: TrendingUp, color: PURPLE },
  { key: "marginStock",         label: "Margin chứng khoán",        icon: ChartLine, color: PURPLE },
  { key: "businessDebt",        label: "Vay góp vốn kinh doanh",    icon: Building, color: PURPLE },
  { key: "cryptoLoan",          label: "Vay đầu tư crypto",         icon: Bitcoin, color: "#f97316" },
  { key: "otherInvestmentDebt", label: "Nợ đầu tư khác",            icon: MoreHorizontal, color: PURPLE },
];

/* ─── SELECT OPTIONS ─── */

const EMERGENCY_FUND_OPTIONS: { value: EmergencyFundLevel; label: string }[] = [
  { value: "none", label: "Chưa có quỹ dự phòng" },
  { value: "lt3",  label: "< 3 tháng chi phí" },
  { value: "3to6", label: "3-6 tháng chi phí" },
  { value: "gt6",  label: "> 6 tháng chi phí" },
];

const CRYPTO_EXPOSURE_OPTIONS: { value: CryptoExposure; label: string }[] = [
  { value: "none",    label: "Không có" },
  { value: "lt10",    label: "< 10% TS thanh khoản" },
  { value: "10to30",  label: "10-30%" },
  { value: "gt30",    label: "> 30% — rủi ro cao" },
];

const LIQUIDITY_ACCESS_OPTIONS: { value: LiquidityAccess; label: string }[] = [
  { value: "easy",    label: "Dễ truy cập, an toàn" },
  { value: "partial", label: "Một phần khó truy cập" },
  { value: "stuck",   label: "Có khoản đang bị kẹt" },
];

const CONSUMPTION_LOAD_OPTIONS: { value: ConsumptionLoadLevel; label: string }[] = [
  { value: "low",    label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high",   label: "Cao — áp lực bảo trì + lãi vay" },
];

const HAS_DEBT_OPTIONS: { value: "no" | "some" | "much"; label: string }[] = [
  { value: "no",   label: "Không vay" },
  { value: "some", label: "Có 1 phần vay" },
  { value: "much", label: "Phần lớn vay" },
];

const GROWTH_HOLDING_OPTIONS: { value: GrowthHoldingPeriod; label: string }[] = [
  { value: "short",  label: "< 1 năm" },
  { value: "medium", label: "1-5 năm" },
  { value: "long",   label: "> 5 năm" },
];

const GROWTH_LEVERAGE_OPTIONS: { value: GrowthLeverage; label: string }[] = [
  { value: "no",   label: "Không vay" },
  { value: "low",  label: "Đòn bẩy nhẹ" },
  { value: "high", label: "Đòn bẩy cao" },
];

const DROP_REACTION_OPTIONS: { value: DropReaction; label: string }[] = [
  { value: "panic",    label: "Sẽ phải bán cắt lỗ" },
  { value: "hold",     label: "Có thể tiếp tục nắm giữ" },
  { value: "buyMore",  label: "Sẽ mua thêm" },
];

const CASHFLOW_STABILITY_OPTIONS: { value: CashflowAssetStability; label: string }[] = [
  { value: "low",    label: "Thấp · biến động" },
  { value: "medium", label: "Trung bình" },
  { value: "high",   label: "Cao · rất ổn định" },
];

const RATE_TYPE_OPTIONS: { value: RateType; label: string }[] = [
  { value: "fixed",    label: "Cố định" },
  { value: "floating", label: "Thả nổi" },
  { value: "mixed",    label: "Hỗn hợp" },
];

const RATE_AFFORD_OPTIONS: { value: RateIncreaseAffordability; label: string }[] = [
  { value: "no",    label: "Không chịu nổi" },
  { value: "tight", label: "Vừa đủ" },
  { value: "yes",   label: "Dư khả năng trả" },
];

const RETURN_VS_RATE_OPTIONS: { value: ReturnVsRate; label: string }[] = [
  { value: "below", label: "Thấp hơn lãi vay" },
  { value: "equal", label: "Tương đương" },
  { value: "above", label: "Cao hơn lãi vay" },
];

const DROP_PRESSURE_OPTIONS: { value: "yes" | "tight" | "no"; label: string }[] = [
  { value: "yes",   label: "Có · phải bán" },
  { value: "tight", label: "Áp lực nhưng vẫn cầm cự" },
  { value: "no",    label: "Không · vẫn ổn" },
];

const DEBT_EXIT_OPTIONS: { value: DebtExitPlan; label: string }[] = [
  { value: "none",    label: "Chưa có kế hoạch" },
  { value: "partial", label: "Có 1 phần" },
  { value: "clear",   label: "Rõ ràng · timeline cụ thể" },
];

export default function NetWorthSubSection({ data, onChange }: Props) {
  const setAsset = <K extends keyof NetWorthAssets>(
    k: K,
    v: NetWorthAssets[K]
  ) => {
    onChange({
      ...data,
      assets: { ...(data.assets ?? {}), [k]: v },
    });
  };
  const setLiab = <K extends keyof NetWorthLiabilities>(
    k: K,
    v: NetWorthLiabilities[K]
  ) => {
    onChange({
      ...data,
      liabilities: { ...(data.liabilities ?? {}), [k]: v },
    });
  };

  const stats = useMemo(() => {
    const sumNumbers = (o: object | undefined) =>
      Object.values(o ?? {}).reduce<number>(
        (s, v) => s + (typeof v === "number" ? v : 0),
        0
      );
    const totalAssets = sumNumbers(data.assets);
    const totalLiab = sumNumbers(data.liabilities);
    const netWorth = totalAssets - totalLiab;
    return { totalAssets, totalLiab, netWorth };
  }, [data]);

  const assets = (data.assets ?? {}) as Record<string, number | undefined>;
  const liab = (data.liabilities ?? {}) as Record<string, number | undefined>;

  return (
    <div className="space-y-4">
      {/* Big summary */}
      <div
        className="rounded-2xl p-4 sm:p-5 grid grid-cols-3 gap-3 sm:gap-5"
        style={{
          background:
            stats.netWorth >= 0
              ? `linear-gradient(135deg, ${GREEN}14, transparent)`
              : `linear-gradient(135deg, ${RED}14, transparent)`,
          border: `1px solid ${stats.netWorth >= 0 ? GREEN : RED}55`,
        }}
      >
        <Stat label="Tổng tài sản" value={stats.totalAssets} color={GREEN} />
        <Stat label="Tổng nợ" value={stats.totalLiab} color={RED} />
        <Stat
          label="Net Worth"
          value={stats.netWorth}
          color={stats.netWorth >= 0 ? GREEN : RED}
        />
      </div>

      {/* ─── A. TÀI SẢN THANH KHOẢN ─── */}
      <Group label="A. Tài sản thanh khoản" sub="Tiền mặt + tiết kiệm + vàng + crypto…" color={GREEN}>
        <FieldGrid fields={LIQUID_FIELDS} values={assets} onChange={setAsset} />
        <div className="grid sm:grid-cols-3 gap-2.5 mt-2.5">
          <SelectField
            label="Quỹ dự phòng khẩn cấp"
            icon={ShieldAlert}
            color={GREEN}
            value={data.assets?.emergencyFundMonths}
            options={EMERGENCY_FUND_OPTIONS}
            onChange={(v) => setAsset("emergencyFundMonths", v)}
          />
          <SelectField
            label="% Crypto trong thanh khoản"
            icon={Bitcoin}
            color="#f97316"
            value={data.assets?.cryptoExposurePct}
            options={CRYPTO_EXPOSURE_OPTIONS}
            onChange={(v) => setAsset("cryptoExposurePct", v)}
          />
          <SelectField
            label="Mức độ truy cập"
            icon={Banknote}
            color={GREEN}
            value={data.assets?.liquidityAccess}
            options={LIQUIDITY_ACCESS_OPTIONS}
            onChange={(v) => setAsset("liquidityAccess", v)}
          />
        </div>
      </Group>

      {/* ─── B. TÀI SẢN TIÊU DÙNG ─── */}
      <Group label="B. Tài sản tiêu dùng" sub="Nhà ở + xe + nội thất + đồ cá nhân" color={AMBER}>
        <FieldGrid fields={CONSUMPTION_FIELDS} values={assets} onChange={setAsset} />
        <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
          <SelectField
            label="Áp lực bảo trì / phí vận hành"
            icon={Receipt}
            color={AMBER}
            value={data.assets?.consumptionMaintenanceLoad}
            options={CONSUMPTION_LOAD_OPTIONS}
            onChange={(v) => setAsset("consumptionMaintenanceLoad", v)}
          />
          <SelectField
            label="Mua bằng nợ trả góp"
            icon={CreditCard}
            color={AMBER}
            value={data.assets?.consumptionOnDebt}
            options={HAS_DEBT_OPTIONS}
            onChange={(v) => setAsset("consumptionOnDebt", v)}
          />
        </div>
      </Group>

      {/* ─── C. TÀI SẢN TĂNG TRƯỞNG ─── */}
      <Group label="C. Tài sản tăng trưởng" sub="Đất nền + cổ phiếu + quỹ + startup…" color={BLUE}>
        <FieldGrid fields={GROWTH_FIELDS} values={assets} onChange={setAsset} />
        <div className="grid sm:grid-cols-3 gap-2.5 mt-2.5">
          <SelectField
            label="Thời gian nắm giữ dự kiến"
            icon={TrendingUp}
            color={BLUE}
            value={data.assets?.growthHoldingPeriod}
            options={GROWTH_HOLDING_OPTIONS}
            onChange={(v) => setAsset("growthHoldingPeriod", v)}
          />
          <SelectField
            label="Có dùng đòn bẩy vay?"
            icon={CreditCard}
            color={BLUE}
            value={data.assets?.growthLeverage}
            options={GROWTH_LEVERAGE_OPTIONS}
            onChange={(v) => setAsset("growthLeverage", v)}
          />
          <SelectField
            label="Nếu thị trường giảm 20-30%?"
            icon={ShieldAlert}
            color={BLUE}
            value={data.assets?.growthDropReaction}
            options={DROP_REACTION_OPTIONS}
            onChange={(v) => setAsset("growthDropReaction", v)}
          />
        </div>
      </Group>

      {/* ─── D. TÀI SẢN DÒNG TIỀN ─── */}
      <Group label="D. Tài sản dòng tiền" sub="BĐS cho thuê + cổ tức + bản quyền…" color={BRAND}>
        <FieldGrid fields={CASHFLOW_FIELDS} values={assets} onChange={setAsset} />
        <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
          <SelectField
            label="Độ ổn định dòng tiền"
            icon={ChartLine}
            color={BRAND}
            value={data.assets?.cashflowStability}
            options={CASHFLOW_STABILITY_OPTIONS}
            onChange={(v) => setAsset("cashflowStability", v)}
          />
          <SelectField
            label="Tài sản dòng tiền có vay vốn?"
            icon={CreditCard}
            color={BRAND}
            value={data.assets?.cashflowOnDebt}
            options={HAS_DEBT_OPTIONS}
            onChange={(v) => setAsset("cashflowOnDebt", v)}
          />
        </div>
      </Group>

      {/* ─── E. NỢ TIÊU DÙNG ─── */}
      <Group label="E. Nợ tiêu dùng ngắn hạn" sub="Thẻ tín dụng + vay tiêu dùng + trả góp…" color={RED}>
        <FieldGrid fields={CONSUMER_DEBT_FIELDS} values={liab} onChange={setLiab} />
        <div className="grid sm:grid-cols-3 gap-2.5 mt-2.5">
          <NumberField
            label="Trả nợ tiêu dùng /tháng"
            icon={Receipt}
            color={RED}
            value={data.liabilities?.consumerDebtMonthly}
            onChange={(v) => setLiab("consumerDebtMonthly", v)}
          />
          <BoolField
            label="Có khoản > 20%/năm?"
            icon={ShieldAlert}
            color={RED}
            value={data.liabilities?.hasHighInterestDebt}
            onChange={(v) => setLiab("hasHighInterestDebt", v)}
          />
          <BoolField
            label="Có khoản quá hạn?"
            icon={ShieldAlert}
            color={RED}
            value={data.liabilities?.hasPastDueDebt}
            onChange={(v) => setLiab("hasPastDueDebt", v)}
          />
        </div>
      </Group>

      {/* ─── F. NỢ MUA NHÀ / XE ─── */}
      <Group label="F. Nợ mua nhà / xe để ở" sub="Vay mua nhà + sửa nhà + mua xe" color={AMBER}>
        <FieldGrid fields={HOME_CAR_DEBT_FIELDS} values={liab} onChange={setLiab} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5">
          <NumberField
            label="Trả nợ nhà-xe /tháng"
            icon={Receipt}
            color={AMBER}
            value={data.liabilities?.familyDebtMonthly}
            onChange={(v) => setLiab("familyDebtMonthly", v)}
          />
          <SelectField
            label="Loại lãi suất"
            icon={ChartLine}
            color={AMBER}
            value={data.liabilities?.familyDebtRateType}
            options={RATE_TYPE_OPTIONS}
            onChange={(v) => setLiab("familyDebtRateType", v)}
          />
          <SelectField
            label="Khả năng chịu khi lãi tăng"
            icon={ShieldAlert}
            color={AMBER}
            value={data.liabilities?.familyRateIncreaseAffordable}
            options={RATE_AFFORD_OPTIONS}
            onChange={(v) => setLiab("familyRateIncreaseAffordable", v)}
          />
          <BoolField
            label="Có bảo hiểm khoản vay?"
            icon={ShieldAlert}
            color={AMBER}
            value={data.liabilities?.familyDebtHasInsurance}
            onChange={(v) => setLiab("familyDebtHasInsurance", v)}
          />
        </div>
      </Group>

      {/* ─── G. NỢ ĐẦU TƯ ─── */}
      <Group label="G. Nợ đầu tư" sub="Vay mua BĐS + cổ phiếu + margin + crypto…" color={PURPLE}>
        <FieldGrid fields={INVESTMENT_DEBT_FIELDS} values={liab} onChange={setLiab} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2.5">
          <NumberField
            label="Trả nợ đầu tư /tháng"
            icon={Receipt}
            color={PURPLE}
            value={data.liabilities?.investmentDebtMonthly}
            onChange={(v) => setLiab("investmentDebtMonthly", v)}
          />
          <SelectField
            label="Lợi suất kỳ vọng vs lãi vay"
            icon={ChartLine}
            color={PURPLE}
            value={data.liabilities?.investmentReturnVsRate}
            options={RETURN_VS_RATE_OPTIONS}
            onChange={(v) => setLiab("investmentReturnVsRate", v)}
          />
          <SelectField
            label="Áp lực khi TS giảm 20-30%"
            icon={ShieldAlert}
            color={PURPLE}
            value={data.liabilities?.investmentDropPressure}
            options={DROP_PRESSURE_OPTIONS}
            onChange={(v) => setLiab("investmentDropPressure", v)}
          />
          <BoolField
            label="Có tài sản đảm bảo?"
            icon={ShieldAlert}
            color={PURPLE}
            value={data.liabilities?.investmentHasCollateral}
            onChange={(v) => setLiab("investmentHasCollateral", v)}
          />
          <SelectField
            label="Kế hoạch thoát nợ"
            icon={ChartBar}
            color={PURPLE}
            value={data.liabilities?.investmentDebtExitPlan}
            options={DEBT_EXIT_OPTIONS}
            onChange={(v) => setLiab("investmentDebtExitPlan", v)}
          />
        </div>
      </Group>

      {/* Note: phân tích chi tiết Asset + Debt + Net Worth sẽ hiển thị
          trong Báo cáo Premium ở mục cuối */}
      <div
        className="rounded-md px-3 py-2.5 text-[11px] leading-snug"
        style={{
          background: `${BRAND}10`,
          color: BRAND,
          border: `1px dashed ${BRAND}44`,
        }}
      >
        📊 Phân tích chi tiết cơ cấu tài sản · cơ cấu nợ · Net Worth (4 nhóm
        tỷ trọng + threshold + chất lượng nợ) sẽ hiển thị trong Báo cáo Premium
        ở mục cuối.
      </div>
    </div>
  );
}

/* ─── primitives ─── */

function Group({
  label,
  sub,
  color,
  children,
}: {
  label: string;
  sub?: string;
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
      <div>
        <div
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </div>
        {sub && (
          <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldGrid<T extends string>({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef<T>[];
  values: Record<string, number | undefined>;
  onChange: (k: T, v: number | undefined) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {fields.map((f) => {
        const Icon = f.icon;
        const value = values[f.key] ?? undefined;
        const display = value && value > 0 ? value.toLocaleString("vi-VN") : "";
        return (
          <div key={f.key}>
            <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
              <Icon size={11} style={{ color: f.color }} />
              {f.label}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  onChange(f.key, cleaned ? parseInt(cleaned, 10) : undefined);
                }}
                placeholder="0"
                className="w-full px-2.5 py-1.5 pr-7 rounded-md text-[12px] font-bold text-white text-right outline-none"
                style={{
                  background: "#0a0a0a",
                  border: `1px solid ${value ? `${f.color}77` : "#2a2a2a"}`,
                }}
              />
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
                style={{ color: value ? f.color : "#525252" }}
              >
                ₫
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  icon: Icon,
  color,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: typeof Wallet;
  color: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
        <Icon size={11} style={{ color }} />
        {label}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as T) || undefined)}
        className="w-full px-2.5 py-1.5 rounded-md text-[12px] font-bold outline-none cursor-pointer"
        style={{
          background: "#0a0a0a",
          color: value ? "#fff" : "#525252",
          border: `1px solid ${value ? `${color}77` : "#2a2a2a"}`,
        }}
      >
        <option value="">— chọn —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#141414" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  icon: Icon,
  color,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Wallet;
  color: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const display = value && value > 0 ? value.toLocaleString("vi-VN") : "";
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
        <Icon size={11} style={{ color }} />
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, "");
            onChange(cleaned ? parseInt(cleaned, 10) : undefined);
          }}
          placeholder="0"
          className="w-full px-2.5 py-1.5 pr-7 rounded-md text-[12px] font-bold text-white text-right outline-none"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${value ? `${color}77` : "#2a2a2a"}`,
          }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
          style={{ color: value ? color : "#525252" }}
        >
          ₫
        </span>
      </div>
    </div>
  );
}

function BoolField({
  label,
  icon: Icon,
  color,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Wallet;
  color: string;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
        <Icon size={11} style={{ color }} />
        {label}
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onChange(value === true ? undefined : true)}
          className="px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-colors"
          style={{
            background: value === true ? color : "#0a0a0a",
            color: value === true ? "#fff" : "#888",
            border: `1px solid ${value === true ? color : "#2a2a2a"}`,
          }}
        >
          Có
        </button>
        <button
          type="button"
          onClick={() => onChange(value === false ? undefined : false)}
          className="px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-colors"
          style={{
            background: value === false ? "#444" : "#0a0a0a",
            color: value === false ? "#fff" : "#888",
            border: `1px solid ${value === false ? "#666" : "#2a2a2a"}`,
          }}
        >
          Không
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
        {label}
      </div>
      <div className="text-lg sm:text-xl font-extrabold" style={{ color }}>
        {fmtCompact(value)}
      </div>
    </div>
  );
}

function fmtCompact(n: number): string {
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9)
    return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}

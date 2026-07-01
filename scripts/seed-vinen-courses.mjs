// Seed 10 VINEN courses for "Tinh Hoa Quản Trị và Khởi Nghiệp" program
// Run: SUPABASE_PAT=... SUPABASE_PROJECT_REF=... node scripts/seed-vinen-courses.mjs

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_REF;
if (!PAT || !REF) {
  console.error("Need SUPABASE_PAT + SUPABASE_PROJECT_REF env vars");
  process.exit(1);
}

const courses = [
  {
    slug: "pham-chat-va-nang-luc-cua-nha-sang-lap",
    title: "Phẩm chất và năng lực của Nhà Sáng Lập",
    description: "Khám phá 5 phẩm chất cốt lõi và 7 năng lực thiết yếu giúp founder dẫn dắt startup từ ý tưởng đến scale-up. Bài kiểm tra năng lực founder cá nhân hoá."
  },
  {
    slug: "chien-luoc-va-ke-hoach-kinh-doanh-cho-nha-sang-lap",
    title: "Chiến lược và kế hoạch kinh doanh cho Nhà Sáng Lập",
    description: "Xây dựng business plan + chiến lược tăng trưởng giai đoạn early-stage. Mô hình kinh doanh, định vị, lộ trình từ pre-seed đến series A."
  },
  {
    slug: "quan-tri-nhan-su-toan-dien-cho-nha-sang-lap",
    title: "Quản trị Nhân Sự toàn diện cho Nhà Sáng Lập",
    description: "Tuyển dụng, đánh giá, giữ chân nhân tài + xây dựng OKR cho founding team. Quản trị nhân sự từ 5 đến 50 người trong startup."
  },
  {
    slug: "xay-dung-co-cau-to-chuc-cho-nha-sang-lap",
    title: "Xây dựng Cơ Cấu Tổ Chức cho Nhà Sáng Lập",
    description: "Thiết kế org chart, ESOP, cấu trúc founding team. Khi nào cần CTO/COO, cách phân quyền và governance trong startup."
  },
  {
    slug: "tu-duy-thiet-ke-va-phat-trien-san-pham-moi-cho-nha-sang-lap",
    title: "Tư duy Thiết kế và Phát triển Sản Phẩm Mới cho Nhà Sáng Lập",
    description: "Design thinking + product discovery + lean MVP cho founder không xuất thân kỹ thuật. Tìm PMF (product-market fit) trong 90 ngày."
  },
  {
    slug: "phat-trien-thuong-hieu-va-chinh-phuc-thi-truong-cho-nha-sang-lap",
    title: "Phát triển Thương Hiệu và Chinh Phục Thị Trường cho Nhà Sáng Lập",
    description: "Brand positioning, GTM strategy, growth marketing và sales playbook B2B/B2C. Từ 0 đến 1.000 khách hàng đầu tiên."
  },
  {
    slug: "tai-chinh-cho-nha-sang-lap",
    title: "Tài Chính cho Nhà Sáng Lập",
    description: "Mô hình tài chính, dòng tiền, gọi vốn, unit economics, runway management. Pitch deck tài chính cho nhà đầu tư."
  },
  {
    slug: "lanh-dao-va-van-hoa-khoi-nghiep",
    title: "Lãnh Đạo và Văn Hoá Khởi Nghiệp",
    description: "Phong cách lãnh đạo founder + xây dựng văn hoá công ty từ ngày đầu. Truyền cảm hứng, sự gắn kết và principles framework."
  },
  {
    slug: "cong-nghe-cho-nha-sang-lap",
    title: "Công Nghệ cho Nhà Sáng Lập",
    description: "Kiến trúc tech, hire CTO, no-code stack, AI tools cho founder. Lựa chọn build vs buy, tech debt và roadmap kỹ thuật."
  },
  {
    slug: "phap-ly-cho-nha-sang-lap",
    title: "Pháp Lý cho Nhà Sáng Lập",
    description: "Cấu trúc pháp lý startup VN, IP, hợp đồng đầu tư (SAFE, term sheet), thuế và compliance. Tránh các bẫy pháp lý điển hình."
  },
];

// Build idempotent INSERT ... ON CONFLICT statement
const values = courses.map((c, i) => {
  const esc = (s) => s.replace(/'/g, "''");
  return `('${c.slug}', '${esc(c.title)}', '${esc(c.description)}', 'course', 'tinh-hoa-quan-tri', 'published', 0, null, 'free', ${i + 1})`;
}).join(",\n  ");

const sql = `
insert into public.products (slug, title, description, type, category, status, price, sale_price, tier_required, sort_order)
values
  ${values}
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  category = excluded.category,
  sort_order = excluded.sort_order
returning slug, title;
`;

console.log(`Inserting ${courses.length} courses...`);

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

const text = await r.text();
if (!r.ok) {
  console.error(`HTTP ${r.status}\n${text}`);
  process.exit(1);
}

const json = JSON.parse(text);
console.log(`OK — upserted ${json.length} courses:`);
for (const row of json) console.log(`  ${row.slug.padEnd(60)} → ${row.title}`);

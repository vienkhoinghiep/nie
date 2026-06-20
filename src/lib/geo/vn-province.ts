/**
 * Suy ra Tỉnh/Thành (Việt Nam) từ IP qua header geo của Vercel.
 * Vercel tự thêm các header này cho mọi request (không cần dịch vụ ngoài):
 *   - x-vercel-ip-country         (vd. "VN")
 *   - x-vercel-ip-country-region  (ISO 3166-2 code, vd. "HN", "SG", "01")
 *   - x-vercel-ip-city            (vd. "Hanoi", có thể URL-encoded)
 *
 * Local dev không có các header này → trả null (chỉ có số liệu trên production).
 */

// ISO 3166-2:VN region code → tên tỉnh/thành
const VN_PROVINCES: Record<string, string> = {
  HN: "Hà Nội",
  SG: "Hồ Chí Minh",
  HP: "Hải Phòng",
  DN: "Đà Nẵng",
  CT: "Cần Thơ",
  "01": "Lai Châu",
  "02": "Lào Cai",
  "03": "Hà Giang",
  "04": "Cao Bằng",
  "05": "Sơn La",
  "06": "Yên Bái",
  "07": "Tuyên Quang",
  "09": "Lạng Sơn",
  "13": "Quảng Ninh",
  "14": "Hòa Bình",
  "18": "Ninh Bình",
  "20": "Thái Bình",
  "21": "Thanh Hóa",
  "22": "Nghệ An",
  "23": "Hà Tĩnh",
  "24": "Quảng Bình",
  "25": "Quảng Trị",
  "26": "Thừa Thiên Huế",
  "27": "Quảng Nam",
  "28": "Kon Tum",
  "29": "Quảng Ngãi",
  "30": "Gia Lai",
  "31": "Bình Định",
  "32": "Phú Yên",
  "33": "Đắk Lắk",
  "34": "Khánh Hòa",
  "35": "Lâm Đồng",
  "36": "Ninh Thuận",
  "37": "Tây Ninh",
  "39": "Đồng Nai",
  "40": "Bình Thuận",
  "41": "Long An",
  "43": "Bà Rịa - Vũng Tàu",
  "44": "An Giang",
  "45": "Đồng Tháp",
  "46": "Tiền Giang",
  "47": "Kiên Giang",
  "49": "Vĩnh Long",
  "50": "Bến Tre",
  "51": "Trà Vinh",
  "52": "Sóc Trăng",
  "53": "Bắc Kạn",
  "54": "Bắc Giang",
  "55": "Bạc Liêu",
  "56": "Bắc Ninh",
  "57": "Bình Dương",
  "58": "Bình Phước",
  "59": "Cà Mau",
  "61": "Hải Dương",
  "63": "Hà Nam",
  "66": "Hưng Yên",
  "67": "Nam Định",
  "68": "Phú Thọ",
  "69": "Thái Nguyên",
  "70": "Vĩnh Phúc",
  "71": "Điện Biên",
  "72": "Đắk Nông",
  "73": "Hậu Giang",
};

export interface GeoLocation {
  country: string | null;
  province: string | null;
  city: string | null;
}

export function geoFromHeaders(headers: Headers): GeoLocation {
  const country = headers.get("x-vercel-ip-country") || null;
  const region = headers.get("x-vercel-ip-country-region") || null;
  const cityRaw = headers.get("x-vercel-ip-city") || null;
  let city: string | null = null;
  if (cityRaw) {
    try {
      city = decodeURIComponent(cityRaw);
    } catch {
      city = cityRaw;
    }
  }

  let province: string | null = null;
  if (country === "VN" && region) {
    province = VN_PROVINCES[region.toUpperCase()] || VN_PROVINCES[region] || null;
  }
  // Không map được code → dùng tên thành phố làm nhãn vị trí.
  if (!province && city) province = city;

  return { country, province, city };
}

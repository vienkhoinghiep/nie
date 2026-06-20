# Event Images

Section "Đào Tạo Trực Tiếp Cho 1.000+ Doanh Nhân" trên trang chủ
(`src/app/HomePage.tsx`) đọc 5 file ảnh sau:

| File          | Mô tả                                                                            | Vị trí trên trang chủ                |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| `event-1.jpg` | Hero — anh Tuệ trên sân khấu Tọa Đàm với chủ đề "Kiếm — Giữ — Nhân Tiền"        | Ảnh lớn 2x2 ở góc trái                |
| `event-2.jpg` | Toàn cảnh hội trường (chụp từ phía sau, có màn LED + khán giả)                   | Ảnh nhỏ — hàng 1, vị trí 1            |
| `event-3.jpg` | Khán giả tập trung lắng nghe (chụp gần, hàng đầu)                                | Ảnh nhỏ — hàng 1, vị trí 2            |
| `event-4.jpg` | Anh Tuệ trình bày (chỉ tay, có flipchart bên phải)                                | Ảnh nhỏ — hàng 2, vị trí 1            |
| `event-5.jpg` | Hội trường nhìn từ sau (có 2 màn LED, khán giả đông)                              | Ảnh nhỏ — hàng 2, vị trí 2            |

## Hướng dẫn upload

1. Save 5 ảnh đó về máy với tên đúng (`event-1.jpg`, `event-2.jpg`, …, `event-5.jpg`)
2. Copy vào thư mục này (`public/images/events/`)
3. Refresh trang chủ → ảnh sẽ hiển thị ngay (Next.js serve trực tiếp từ `/public`)

## Tối ưu kích thước (tuỳ chọn)

Ảnh gốc khoảng 7-20 MB / file → nên nén xuống 300-500 KB / file cho web:

```bash
# Dùng ImageMagick (Windows: choco install imagemagick)
magick event-1.jpg -resize "1600x" -quality 82 event-1.jpg
magick event-2.jpg -resize "1200x" -quality 82 event-2.jpg
# … tương tự cho event-3, event-4, event-5
```

Hoặc dùng web tool: [tinyjpg.com](https://tinyjpg.com) — kéo thả 5 file vào, tải về, replace.

## Đổi ảnh / thêm ảnh

Sửa array trong `src/app/HomePage.tsx` (tìm comment `Events Gallery`) để
thêm / bớt / đổi tên file.

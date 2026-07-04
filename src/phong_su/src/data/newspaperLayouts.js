// Metadata các bố cục trang báo — dùng cho UI picker trong NewspaperScene.
// Bản thân cách sắp xếp thật của từng layout nằm ở CSS (index.css, các
// class `.layout-*` áp `grid-template-areas` khác nhau lên `.np-paper-grid`)
// — file này CHỈ để hiển thị danh sách lựa chọn, không chứa logic layout.
export const NEWSPAPER_LAYOUTS = [
  {
    id: 'classic',
    name: 'Trang Nhất Cổ Điển',
    desc: 'Ảnh chính bên trái, hộp trích dẫn bên phải — kiểu báo giấy truyền thống.',
    icon: '📰',
  },
  {
    id: 'magazine',
    name: 'Tạp Chí',
    desc: 'Ảnh chính chạy full-width nổi bật, chữ chia 2 cột đều bên dưới.',
    icon: '🗞️',
  },
  {
    id: 'grid',
    name: 'Lưới Ảnh Nổi Bật',
    desc: 'Ưu tiên hình ảnh: ảnh chính lớn + ảnh phụ, dải 3 ảnh nhỏ giữa trang.',
    icon: '🖼️',
  },
  {
    id: 'strip',
    name: 'Dải Dọc Photobooth',
    desc: 'Khổ hẹp, mọi thứ xếp dọc thành 1 dải — cảm giác như dải ảnh photobooth.',
    icon: '🎞️',
  },
]

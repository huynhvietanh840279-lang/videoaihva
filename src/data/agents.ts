export interface Agent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  zalo: string;
  verified: boolean;
  joinedAt: string;
  bio: string;
  isAgency?: boolean;
}

const names = [
  "Nguyễn Văn Hùng",
  "Trần Thị Mai Anh",
  "Lê Minh Quân",
  "Phạm Thu Hà",
  "Hoàng Đức Thắng",
  "Vũ Thị Ngọc Lan",
  "Đặng Quốc Bảo",
  "Bùi Hải Yến",
  "Đỗ Trung Kiên",
  "Ngô Phương Thảo",
  "Lý Gia Huy",
  "Trịnh Thanh Tùng",
];

const bios = [
  "Chuyên viên tư vấn bất động sản khu Đông, hơn 8 năm kinh nghiệm.",
  "Hỗ trợ khách hàng mua bán căn hộ và nhà phố, tư vấn pháp lý miễn phí.",
  "Chuyên đất nền và dự án vùng ven, cam kết thông tin chính xác.",
  "Môi giới nhà phố trung tâm, hỗ trợ vay ngân hàng lên tới 70%.",
];

export const agents: Agent[] = names.map((name, i) => ({
  id: `agent-${i + 1}`,
  name,
  avatar: `https://i.pravatar.cc/200?img=${i + 5}`,
  phone: `09${63 + i}357${String(100 + i * 7).slice(0, 3)}`,
  zalo: `09${63 + i}357${String(100 + i * 7).slice(0, 3)}`,
  verified: i % 3 !== 2,
  joinedAt: new Date(2019 + (i % 5), (i * 3) % 12, 5 + (i % 20)).toISOString(),
  bio: bios[i % bios.length],
  isAgency: i % 4 === 0,
}));

export const getAgent = (id: string) => agents.find((a) => a.id === id);

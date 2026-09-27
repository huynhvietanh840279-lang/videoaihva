import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dang-ky")({
  head: () => ({
    meta: [
      { title: "Đăng ký tài khoản — NhàĐất Hub" },
      { name: "description", content: "Tạo tài khoản miễn phí để đăng tin nhà đất và lưu tin yêu thích." },
      { property: "og:title", content: "Đăng ký tài khoản — NhàĐất Hub" },
      { property: "og:description", content: "Đăng ký miễn phí chỉ trong một phút." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <div className="container-page grid gap-8 py-12 md:grid-cols-2">
      <img
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80"
        alt=""
        className="hidden rounded-xl object-cover md:block"
      />
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy">Đăng ký</h1>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Tạo tài khoản thành công");
            navigate({ to: "/tai-khoan" });
          }}
        >
          <Input placeholder="Họ và tên" required />
          <Input placeholder="Số điện thoại" required />
          <Input type="email" placeholder="Email" required />
          <Input type="password" placeholder="Mật khẩu" required minLength={6} />
          <Input type="password" placeholder="Nhập lại mật khẩu" required minLength={6} />
          <Button type="submit" className="w-full">Tạo tài khoản</Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link to="/dang-nhap" className="font-medium text-primary">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

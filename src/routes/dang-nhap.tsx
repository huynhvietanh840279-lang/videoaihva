import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dang-nhap")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — NhàĐất Hub" },
      { name: "description", content: "Đăng nhập để lưu tin yêu thích và quản lý tin đăng của bạn." },
      { property: "og:title", content: "Đăng nhập — NhàĐất Hub" },
      { property: "og:description", content: "Truy cập tài khoản NhàĐất Hub của bạn." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="container-page grid gap-8 py-12 md:grid-cols-2">
      <img
        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80"
        alt=""
        className="hidden rounded-xl object-cover md:block"
      />
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy">Đăng nhập</h1>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Đăng nhập thành công");
            navigate({ to: "/tai-khoan" });
          }}
        >
          <Input placeholder="Số điện thoại hoặc email" required />
          <Input type="password" placeholder="Mật khẩu" required minLength={6} />
          <Button type="submit" className="w-full">Đăng nhập</Button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link to="/dang-ky" className="font-medium text-primary">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

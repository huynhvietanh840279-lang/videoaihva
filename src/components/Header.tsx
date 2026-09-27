import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Heart, Menu, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useFavorites } from "@/store/favorites";

const navItems = [
  { label: "Nhà đất bán", to: "/tim-kiem" as const, search: { transactionType: "sale" as const } },
  {
    label: "Bán đất",
    to: "/tim-kiem" as const,
    search: { transactionType: "sale" as const, categoryId: "dat" },
  },
  { label: "Nhà đất cho thuê", to: "/tim-kiem" as const, search: { transactionType: "rent" as const } },
  { label: "Dự án", to: "/du-an" as const, search: {} },
  { label: "Tin tức", to: "/tin-tuc" as const, search: {} },
  { label: "Báo giá", to: "/bao-gia" as const, search: {} },
];

export function Header() {
  const count = useFavorites((s) => s.ids.length);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-navy">
          <Building2 className="h-6 w-6 text-primary" />
          NhàĐất<span className="text-primary">Hub</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-soft hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/tai-khoan"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
            aria-label="Tin đã lưu"
          >
            <Heart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>

          <Link to="/dang-nhap" className="hidden text-sm font-medium hover:text-primary sm:block">
            Đăng nhập
          </Link>
          <Link to="/dang-ky" className="hidden text-sm font-medium hover:text-primary sm:block">
            Đăng ký
          </Link>

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/dang-tin">
              <Plus className="h-4 w-4" /> ĐĂNG TIN
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4">Danh mục</SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    search={item.search}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-border pt-3">
                  <Link
                    to="/dang-nhap"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/dang-ky"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    Đăng ký
                  </Link>
                  <Button asChild className="mt-2 w-full">
                    <Link to="/dang-tin" onClick={() => setOpen(false)}>
                      <Plus className="h-4 w-4" /> ĐĂNG TIN
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

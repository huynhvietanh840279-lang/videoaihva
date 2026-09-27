import { createFileRoute, Link } from "@tanstack/react-router";

import { ListingCard } from "@/components/ListingCard";
import { getListingsByIds } from "@/lib/api";
import { useFavorites } from "@/store/favorites";

export const Route = createFileRoute("/tai-khoan")({
  head: () => ({
    meta: [
      { title: "Tài khoản của tôi — NhàĐất Hub" },
      { name: "description", content: "Quản lý tin đăng, tin đã lưu và hồ sơ cá nhân của bạn." },
      { property: "og:title", content: "Tài khoản của tôi — NhàĐất Hub" },
      { property: "og:description", content: "Tin đã lưu và tin đăng của bạn tại NhàĐất Hub." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const ids = useFavorites((s) => s.ids);
  const saved = getListingsByIds(ids);

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold text-navy">Tin đã lưu</h1>
      {saved.length === 0 ? (
        <p className="mt-3 text-muted-foreground">
          Bạn chưa lưu tin nào.{" "}
          <Link to="/tim-kiem" search={{ transactionType: "sale" }} className="font-medium text-primary">
            Tìm bất động sản ngay
          </Link>
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

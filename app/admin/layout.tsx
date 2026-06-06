import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Don Social Bar · Panel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>;
}

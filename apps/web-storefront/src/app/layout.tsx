export const metadata = {
  title: 'Partner Dashboard - LASTMILE GIG',
  description: 'Manage your restaurant orders and menu',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">LASTMILE GIG</div>
        <nav className="sidebar-nav">
          <a href="#dashboard" className="active">Dashboard</a>
          <a href="#orders">Orders</a>
          <a href="#menu">Menu</a>
          <a href="#analytics">Analytics</a>
          <a href="#settings">Settings</a>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
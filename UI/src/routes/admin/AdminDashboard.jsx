import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./admin.scss";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  overview: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  aadhaar:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/><path d="M14 15h4"/></svg>,
  props:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  txns:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  search:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`statCard sc-${color}`}>
      <div className="scIcon">{icon}</div>
      <div className="scBody">
        <div className="scValue">{value}</div>
        <div className="scLabel">{label}</div>
        {sub && <div className="scSub">{sub}</div>}
      </div>
    </div>
  );
}

// ── User Modal ────────────────────────────────────────────────────────────────
function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    userType: user?.userType || "buyer",
    aadhaarVerified: user?.aadhaarVerified || false,
    isAdmin: user?.isAdmin || false,
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `${API_URL}/admin/users/${user._id}` : `${API_URL}/admin/users`;
      const body = isEdit ? form : { ...form, password: form.newPassword };
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: authHeader(), body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success(isEdit ? "User updated." : "User created.");
      onSaved(data.user);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="editModal" onClick={(e) => e.stopPropagation()}>
        <div className="editModalHeader">
          <h2>{isEdit ? "Edit User" : "Add New User"}</h2>
          <button className="closeBtn" onClick={onClose}>✕</button>
        </div>
        {error && <div className="modalError">{error}</div>}
        <form onSubmit={submit}>
          <div className="editGrid">
            <div className="editField">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={set} required />
            </div>
            <div className="editField">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={set} required />
            </div>
            <div className="editField">
              <label>User Type</label>
              <select name="userType" value={form.userType} onChange={set}>
                <option value="buyer">Buyer / Renter</option>
                <option value="owner">Property Owner</option>
                <option value="agent">Property Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="editField">
              <label>{isEdit ? "New Password" : "Password"}{isEdit && <span className="optional"> (leave blank to keep)</span>}</label>
              <input name="newPassword" type="password" placeholder="Min 6 characters" value={form.newPassword} onChange={set} required={!isEdit} />
            </div>
          </div>
          <div className="editToggles">
            <label className="toggleLabel"><input type="checkbox" name="aadhaarVerified" checked={form.aadhaarVerified} onChange={set} /><span>Aadhaar Verified</span></label>
            <label className="toggleLabel"><input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={set} /><span>Admin Privileges</span></label>
          </div>
          <div className="editActions">
            <button type="button" className="cancelBtn" onClick={onClose}>Cancel</button>
            <button type="submit" className="saveBtn" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save Changes" : "Create User"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [search, setSearch] = useState("");
  const [aadhaarFilter, setAadhaarFilter] = useState("all");

  useEffect(() => {
    if (user !== undefined && (!user || !user.isAdmin)) {
      if (user) toast.error("Access denied.");
      navigate("/admin/login");
    }
  }, [user, navigate]);

  const fetchStats = useCallback(async () => {
    try { const r = await fetch(`${API_URL}/admin/stats`, { headers: authHeader() }); const d = await r.json(); if (r.ok) setStats(d); } catch {}
  }, []);
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API_URL}/admin/users`, { headers: authHeader() }); const d = await r.json(); if (r.ok) setUsers(Array.isArray(d) ? d : []); else throw new Error(d.message); }
    catch (e) { toast.error(e.message || "Failed to load users."); } finally { setLoading(false); }
  }, []);
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API_URL}/admin/properties`, { headers: authHeader() }); const d = await r.json(); if (r.ok) setProperties(Array.isArray(d) ? d : []); else throw new Error(d.message); }
    catch (e) { toast.error(e.message || "Failed to load properties."); } finally { setLoading(false); }
  }, []);
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API_URL}/admin/transactions`, { headers: authHeader() }); const d = await r.json(); if (r.ok) setTransactions(Array.isArray(d) ? d : []); else throw new Error(d.message); }
    catch (e) { toast.error(e.message || "Failed to load transactions."); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setSearch(""); setAadhaarFilter("all");
    if (tab === "overview") fetchStats();
    if (tab === "users") fetchUsers();
    if (tab === "properties") fetchProperties();
    if (tab === "transactions") fetchTransactions();
    if (tab === "aadhaar") fetchUsers();
  }, [tab, fetchStats, fetchUsers, fetchProperties, fetchTransactions]);

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      const r = await fetch(`${API_URL}/admin/users/${id}`, { method: "DELETE", headers: authHeader() });
      const d = await r.json(); if (!r.ok) throw new Error(d.message);
      toast.success("User deleted."); setUsers((p) => p.filter((u) => u._id !== id)); fetchStats();
    } catch (e) { toast.error(e.message); }
  };
  const deleteProperty = async (id) => {
    if (!window.confirm("Permanently delete this property?")) return;
    try {
      const r = await fetch(`${API_URL}/admin/properties/${id}`, { method: "DELETE", headers: authHeader() });
      const d = await r.json(); if (!r.ok) throw new Error(d.message);
      toast.success("Property deleted."); setProperties((p) => p.filter((x) => x._id !== id)); fetchStats();
    } catch (e) { toast.error(e.message); }
  };
  const toggleAadhaar = async (u) => {
    try {
      const r = await fetch(`${API_URL}/admin/users/${u._id}`, { method: "PUT", headers: authHeader(), body: JSON.stringify({ aadhaarVerified: !u.aadhaarVerified }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.message);
      toast.success(`Aadhaar ${!u.aadhaarVerified ? "verified" : "revoked"} for ${u.fullName}.`);
      setUsers((p) => p.map((x) => x._id === u._id ? { ...x, aadhaarVerified: !u.aadhaarVerified } : x)); fetchStats();
    } catch (e) { toast.error(e.message); }
  };
  const handleUserSaved = (saved) => {
    setUsers((p) => { const ex = p.find((u) => u._id === saved._id); return ex ? p.map((u) => u._id === saved._id ? { ...u, ...saved } : u) : [saved, ...p]; });
    fetchStats();
  };

  const fu = users.filter((u) => u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const fa = users.filter((u) => {
    const ms = u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const mf = aadhaarFilter === "all" ? true : aadhaarFilter === "verified" ? u.aadhaarVerified : !u.aadhaarVerified;
    return ms && mf;
  });
  const fp = properties.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.address?.toLowerCase().includes(search.toLowerCase()));
  const ft = transactions.filter((t) => String(t.buyerId).includes(search) || String(t.propertyId).includes(search) || t.status?.includes(search));

  if (!user?.isAdmin) return null;

  const navItems = [
    { key: "overview",     icon: Icons.overview, label: "Overview" },
    { key: "users",        icon: Icons.users,    label: "Users" },
    { key: "aadhaar",      icon: Icons.aadhaar,  label: "Aadhaar" },
    { key: "properties",   icon: Icons.props,    label: "Properties" },
    { key: "transactions", icon: Icons.txns,     label: "Transactions" },
  ];
  const cur = navItems.find((n) => n.key === tab);

  return (
    <div className="adminDashboard">
      {/* ── Sidebar ── */}
      <aside className="adminSidebar">
        <div className="adminBrand">
          <div className="brandIcon">H</div>
          <div className="brandText"><span className="brandName">HabiTrack</span><span className="brandRole">Admin Console</span></div>
        </div>
        <nav className="adminNav">
          {navItems.map((item) => (
            <button key={item.key} className={`navItem ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key)}>
              <span className="navIcon">{item.icon}</span>
              <span className="navLabel">{item.label}</span>
              {item.key === "users" && users.length > 0 && <span className="navBadge">{users.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebarFooter">
          <div className="adminAvatar">{user.fullName?.[0]?.toUpperCase() || "A"}</div>
          <div className="adminUserInfo">
            <span className="adminUserName">{user.fullName || "Admin"}</span>
            <span className="adminUserRole">Administrator</span>
          </div>
          <button className="logoutBtn" onClick={() => { logout(); toast.info("Logged out."); navigate("/admin/login"); }} title="Sign out">
            {Icons.logout}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adminMain">
        {/* Topbar */}
        <div className="adminTopbar">
          <div className="topbarLeft">
            <h1 className="pageTitle">{cur?.label}</h1>
            <span className="pageCrumb">
              {tab === "overview" && "Platform overview"}
              {tab === "users" && `${users.length} total users`}
              {tab === "aadhaar" && `${users.filter((u) => u.aadhaarVerified).length} of ${users.length} verified`}
              {tab === "properties" && `${properties.length} listings`}
              {tab === "transactions" && `${transactions.length} transactions`}
            </span>
          </div>
          <div className="topbarRight">
            {(tab !== "overview") && (
              <div className="searchBox">
                <span className="searchIcon">{Icons.search}</span>
                <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            )}
            {tab === "users" && (
              <button className="primaryBtn" onClick={() => setAddingUser(true)}>
                {Icons.plus} Add User
              </button>
            )}
            {tab === "aadhaar" && (
              <select className="filterSelect" value={aadhaarFilter} onChange={(e) => setAadhaarFilter(e.target.value)}>
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="adminBody">
          {loading && <div className="loadingState"><div className="spinner" /><span>Loading data...</span></div>}

          {/* Overview */}
          {!loading && tab === "overview" && stats && (
            <div className="overviewGrid">
              <div className="statsRow">
                <StatCard icon={Icons.users} label="Total Users" value={stats.totalUsers} color="blue" />
                <StatCard icon={Icons.check} label="Aadhaar Verified" value={stats.verifiedUsers} sub={`${stats.totalUsers > 0 ? Math.round(stats.verifiedUsers / stats.totalUsers * 100) : 0}% rate`} color="green" />
                <StatCard icon={Icons.aadhaar} label="Pending Verification" value={stats.unverifiedUsers} color="amber" />
                <StatCard icon={Icons.props} label="Properties" value={stats.totalProperties} color="purple" />
                <StatCard icon={Icons.txns} label="Transactions" value={stats.totalTransactions} color="teal" />
                <StatCard icon={<span style={{fontSize:16,fontWeight:800}}>₹</span>} label="Total Revenue" value={`₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`} color="orange" />
              </div>
              <div className="recentCard">
                <div className="cardHeader"><h3>Recent Registrations</h3></div>
                <div className="recentList">
                  {!stats.recentUsers?.length && <p className="emptyNote">No users yet.</p>}
                  {stats.recentUsers?.map((u) => (
                    <div className="recentRow" key={u._id}>
                      <div className="rAvatar">{u.fullName?.[0]?.toUpperCase()}</div>
                      <div className="rInfo"><span className="rName">{u.fullName}</span><span className="rEmail">{u.email}</span></div>
                      <div className="rTags">
                        <span className={`chip chip-${u.userType}`}>{u.userType}</span>
                        {u.aadhaarVerified ? <span className="chip chip-verified">Verified</span> : <span className="chip chip-pending">Pending</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {!loading && tab === "users" && (
            <div className="tableCard">
              <table>
                <thead><tr><th>User</th><th>Email</th><th>Type</th><th>Aadhaar</th><th>Admin</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {!fu.length && <tr><td colSpan={7} className="emptyRow">No users found.</td></tr>}
                  {fu.map((u) => (
                    <tr key={u._id}>
                      <td><div className="userCell"><div className="uAvatar">{u.fullName?.[0]?.toUpperCase()}</div><span className="uName">{u.fullName}</span></div></td>
                      <td className="muted">{u.email}</td>
                      <td><span className={`chip chip-${u.userType}`}>{u.userType}</span></td>
                      <td>{u.aadhaarVerified ? <span className="chip chip-verified">Verified</span> : <span className="chip chip-pending">Pending</span>}</td>
                      <td>{u.isAdmin ? <span className="chip chip-admin">Yes</span> : <span className="muted">No</span>}</td>
                      <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      <td><div className="actionBtns"><button className="iconBtn editBtn" onClick={() => setEditingUser(u)} title="Edit">{Icons.edit}</button><button className="iconBtn deleteBtn" onClick={() => deleteUser(u._id)} title="Delete">{Icons.trash}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Aadhaar */}
          {!loading && tab === "aadhaar" && (
            <>
              <div className="aadhaarStats">
                <div className="aaStat aaStat--green"><div className="aaNum">{users.filter((u) => u.aadhaarVerified).length}</div><div className="aaLbl">Verified</div></div>
                <div className="aaStat aaStat--amber"><div className="aaNum">{users.filter((u) => !u.aadhaarVerified).length}</div><div className="aaLbl">Pending</div></div>
                <div className="aaStat aaStat--blue"><div className="aaNum">{users.length > 0 ? Math.round(users.filter((u) => u.aadhaarVerified).length / users.length * 100) : 0}%</div><div className="aaLbl">Rate</div></div>
              </div>
              <div className="tableCard">
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>Type</th><th>Aadhaar No.</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
                  <tbody>
                    {!fa.length && <tr><td colSpan={7} className="emptyRow">No users found.</td></tr>}
                    {fa.map((u) => (
                      <tr key={u._id}>
                        <td><div className="userCell"><div className="uAvatar">{u.fullName?.[0]?.toUpperCase()}</div><span className="uName">{u.fullName}</span></div></td>
                        <td className="muted">{u.email}</td>
                        <td><span className={`chip chip-${u.userType}`}>{u.userType}</span></td>
                        <td className="muted mono">{u.aadhaarNumber ? `XXXX XXXX ${u.aadhaarNumber.slice(-4)}` : "—"}</td>
                        <td>{u.aadhaarVerified ? <span className="chip chip-verified">Verified</span> : <span className="chip chip-pending">Pending</span>}</td>
                        <td className="muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                        <td><button className={u.aadhaarVerified ? "textBtn revokeBtn" : "textBtn verifyBtn"} onClick={() => toggleAadhaar(u)}>{u.aadhaarVerified ? "Revoke" : "Verify"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Properties */}
          {!loading && tab === "properties" && (
            <div className="tableCard">
              <table>
                <thead><tr><th>Title</th><th>Address</th><th>Price</th><th>Beds/Baths</th><th>Legal</th><th>Verified</th><th>Listed</th><th>Actions</th></tr></thead>
                <tbody>
                  {!fp.length && <tr><td colSpan={8} className="emptyRow">No properties found.</td></tr>}
                  {fp.map((p) => (
                    <tr key={p._id}>
                      <td className="bold">{p.title}</td>
                      <td className="muted">{p.address}</td>
                      <td>₹{Number(p.price).toLocaleString("en-IN")}</td>
                      <td className="muted">{p.bedroom}bd / {p.bathroom}ba</td>
                      <td><span className={`chip chip-${p.legalStatus}`}>{p.legalStatus}</span></td>
                      <td>{p.verified ? <span className="chip chip-verified">Yes</span> : <span className="chip chip-pending">No</span>}</td>
                      <td className="muted">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      <td><button className="iconBtn deleteBtn" onClick={() => deleteProperty(p._id)} title="Delete">{Icons.trash}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions */}
          {!loading && tab === "transactions" && (
            <div className="tableCard">
              <table>
                <thead><tr><th>Buyer</th><th>Property</th><th>Type</th><th>Amount</th><th>Status</th><th>Card</th><th>Date</th></tr></thead>
                <tbody>
                  {!ft.length && <tr><td colSpan={7} className="emptyRow">No transactions found.</td></tr>}
                  {ft.map((t) => (
                    <tr key={t._id}>
                      <td className="muted mono">{String(t.buyerId).slice(-8)}</td>
                      <td className="muted mono">{String(t.propertyId).slice(-8)}</td>
                      <td><span className={`chip chip-${t.type === "buy" ? "owner" : "buyer"}`}>{t.type}</span></td>
                      <td className="bold">₹{Number(t.amount).toLocaleString("en-IN")}</td>
                      <td><span className={`chip chip-txn-${t.status}`}>{t.status}</span></td>
                      <td className="muted mono">•••• {t.paymentLast4 || "—"}</td>
                      <td className="muted">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {editingUser && <UserModal user={editingUser} onClose={() => setEditingUser(null)} onSaved={handleUserSaved} />}
      {addingUser  && <UserModal onClose={() => setAddingUser(false)} onSaved={handleUserSaved} />}
    </div>
  );
}

export default AdminDashboard;


import { useState } from "react";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [adminUsers, setAdminUsers] = useState([]);

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setView("dashboard");
    } else {
      alert("Login failed: " + data.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setView("dashboard");
    } else {
      alert("Register failed: " + data.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" });
    setUser(null);
    setView("login");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(`/auth/search?q=${searchQuery}`);
    const data = await res.json();
    setSearchResults(data.users || []);
  };

  const handleFetchAdminUsers = async () => {
    const res = await fetch("/auth/admin/users");
    if (res.ok) {
      const data = await res.json();
      setAdminUsers(data.users || []);
    } else {
      alert("Failed to fetch admin users (status " + res.status + ")");
    }
  };

  const handleDeleteAccount = async () => {
    const res = await fetch("/auth/delete-account", {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    if (res.ok) {
      alert("Account deleted!");
      setUser(null);
      setView("login");
    } else {
      alert("Failed to delete account");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    alert(data.message + (data.token ? "\nToken (for testing): " + data.token : ""));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const res = await fetch("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    const data = await res.json();
    alert(res.ok ? "Password reset successful!" : "Failed: " + data.message);
    if (res.ok) setView("login");
  };

  if (view === "forgot-password" || view === "reset-password") {
    return (
      <div className="container">
        <h2>Password Recovery</h2>
        {view === "forgot-password" ? (
          <form onSubmit={handleForgotPassword} className="card">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Generate Token</button>
            <button type="button" onClick={() => setView("reset-password")}>
              I have a token
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="card">
            <input
              placeholder="Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        )}
        <button onClick={() => setView("login")}>Back to Login</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <h1>Welcome</h1>
        <div className="card">
          <h2>{view === "login" ? "Login" : "Register"}</h2>
          <form onSubmit={view === "login" ? handleLogin : handleRegister}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <br />
            <button type="submit">{view === "login" ? "Login" : "Register"}</button>
          </form>
          <button onClick={() => setView(view === "login" ? "register" : "login")}>
            Switch to {view === "login" ? "Register" : "Login"}
          </button>
          <button onClick={() => setView("forgot-password")}>Forgot Password?</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>
        Logged in as: <strong>{user.username}</strong> ({user.role})
      </p>
      <button onClick={handleLogout}>Logout</button>

      <div className="card">
        <h3>User Search (A05: SQL Injection)</h3>
        <form onSubmit={handleSearch}>
          <input
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          <div style={{ marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => {
                setSearchQuery("' UNION SELECT 999, 'hacked_admin', 'fake_hash', 'admin' --");
              }}
            >
              SQLi: Inject Fake Admin
            </button>
          </div>
        </form>
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((u, i) => (
              <li key={i}>
                {u.username} ({u.role})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3>Admin Panel (A01: Broken Access Control)</h3>
        <p>
          This endpoint lists all users. It's supposed to be admin-only, but the middleware is
          missing.
        </p>
        <button onClick={handleFetchAdminUsers}>Fetch All Users</button>
        {adminUsers.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Hash</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.password_hash?.slice(0, 20)}...</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Account Management (CSRF)</h3>
        <p>This button triggers a GET request to delete your account.</p>
        <button onClick={handleDeleteAccount} style={{ background: "#fcc", color: "#f00" }}>
          Delete My Account (Danger)
        </button>
      </div>
    </div>
  );
}

export default App;

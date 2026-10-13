import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const loadUsers = () => {
    const savedUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    const currentUser =
      JSON.parse(localStorage.getItem("user")) || null;

    let allUsers = [...savedUsers];

    // Add current user if not already inside users
    if (
      currentUser &&
      !allUsers.some(
        (user) =>
          user.email === currentUser.email
      )
    ) {
      allUsers.push(currentUser);
    }

    setUsers(allUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // DELETE USER
  // =========================
  const deleteUser = (email) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    const updatedUsers = users.filter(
      (user) => user.email !== email
    );

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );

    setUsers(updatedUsers);
  };

  // =========================
  // CHANGE ROLE
  // =========================
  const changeRole = (email, newRole) => {
    const updatedUsers = users.map(
      (user) =>
        user.email === email
          ? {
              ...user,
              role: newRole,
            }
          : user
    );

    localStorage.setItem(
      "users",
      JSON.stringify(updatedUsers)
    );

    setUsers(updatedUsers);
  };

  // =========================
  // SEARCH
  // =========================
  const filteredUsers = users.filter(
    (user) =>
      user.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="admin-users-page">

      {/* HEADER */}
      <div className="admin-users-header">

        <div>
          <span className="admin-label">
            KHADAMATX ADMIN
          </span>

          <h1>
            Users Management
          </h1>

          <p>
            Manage customers, providers and
            administrators.
          </p>
        </div>

        <Link
          to="/admin"
          className="back-admin-btn"
        >
          ← Admin Dashboard
        </Link>

      </div>

      {/* SEARCH */}
      <div className="users-toolbar">

        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <span>
          {filteredUsers.length} Users
        </span>

      </div>

      {/* USERS TABLE */}
      <div className="users-table-wrapper">

        <table className="users-table">

          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.length > 0 ? (

              filteredUsers.map(
                (user, index) => (

                  <tr key={user.email}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      <div className="user-info">

                        <div className="user-avatar">
                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {user.name ||
                            "Unknown User"}
                        </strong>

                      </div>
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>

                      <select
                        value={
                          user.role ||
                          "customer"
                        }
                        onChange={(e) =>
                          changeRole(
                            user.email,
                            e.target.value
                          )
                        }
                      >

                        <option value="customer">
                          Customer
                        </option>

                        <option value="provider">
                          Provider
                        </option>

                        <option value="admin">
                          Admin
                        </option>

                      </select>

                    </td>

                    <td>
                      {user.location ||
                        "Not specified"}
                    </td>

                    <td>

                      <button
                        className="delete-user-btn"
                        onClick={() =>
                          deleteUser(
                            user.email
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="no-users"
                >
                  No users found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default AdminUsers;
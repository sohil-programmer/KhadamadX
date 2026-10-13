import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const location = useLocation();

  // ========================================
  // LOGIN STATUS
  // ========================================

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true";

  // ========================================
  // GET USER
  // ========================================

  const savedUser = localStorage.getItem("user");

  let user = null;

  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);

      if (
        parsedUser &&
        typeof parsedUser === "object" &&
        !Array.isArray(parsedUser)
      ) {
        user = parsedUser;
      } else {
        throw new Error("Invalid user object");
      }
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");

      return (
        <Navigate
          to="/login"
          state={{
            from:
              location.pathname +
              location.search +
              location.hash,
          }}
          replace
        />
      );
    }
  }

  // ========================================
  // NOT LOGGED IN
  // ========================================

  if (!isLoggedIn || !user) {
    return (
      <Navigate
        to="/login"
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
        replace
      />
    );
  }

  // ========================================
  // USER ROLE
  // ========================================

  const userRole = String(
    user.role || "customer"
  )
    .trim()
    .toLowerCase();

  const requiredRole = role
    ? String(role).trim().toLowerCase()
    : null;

  // ========================================
  // NO ROLE REQUIRED
  // ========================================

  if (!requiredRole) {
    return children;
  }

  // ========================================
  // CORRECT ROLE
  // ========================================

  if (userRole === requiredRole) {
    return children;
  }

  // ========================================
  // WRONG ROLE
  // ========================================

  if (userRole === "admin") {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  if (userRole === "provider") {
    return (
      <Navigate
        to="/provider-dashboard"
        replace
      />
    );
  }

  // ========================================
  // DEFAULT CUSTOMER
  // ========================================

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
}

export default ProtectedRoute;
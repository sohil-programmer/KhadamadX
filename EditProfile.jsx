import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  // -----------------------------
  // Safe JSON parser
  // -----------------------------
  const readUser = () => {
    try {
      const saved = localStorage.getItem("user");

      if (!saved) {
        return null;
      }

      const parsed = JSON.parse(saved);

      if (!parsed || typeof parsed !== "object") {
        return null;
      }

      return parsed;
    } catch (error) {
      console.error("Failed to read user:", error);
      return null;
    }
  };

  const savedUser = readUser();

  // -----------------------------
  // Initial values
  // -----------------------------
  const initialSkills = Array.isArray(savedUser?.skills)
    ? savedUser.skills.filter(
        (skill) =>
          typeof skill === "string" &&
          skill.trim() !== ""
      )
    : [
        "Web Development",
        "React.js",
        "Laravel",
      ];

  const [name, setName] = useState(
    savedUser?.name || ""
  );

  const [bio, setBio] = useState(
    savedUser?.bio || ""
  );

  const [location, setLocation] = useState(
    savedUser?.location || "Afghanistan"
  );

  const [image, setImage] = useState(
    savedUser?.image || ""
  );

  const [skills, setSkills] = useState(
    initialSkills
  );

  const [skillInput, setSkillInput] =
    useState("");

  // -----------------------------
  // Add skill
  // -----------------------------
  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    if (skill.length > 40) {
      alert("Skill name must be 40 characters or less.");
      return;
    }

    const alreadyExists = skills.some(
      (item) =>
        item.trim().toLowerCase() ===
        skill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setSkills((currentSkills) => [
      ...currentSkills,
      skill,
    ]);

    setSkillInput("");
  };

  // -----------------------------
  // Remove skill
  // -----------------------------
  const removeSkill = (skillToRemove) => {
    setSkills((currentSkills) =>
      currentSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  };

  // -----------------------------
  // Profile image
  // -----------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Image must be smaller than 2MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.onerror = () => {
      alert("Failed to read the image.");
    };

    reader.readAsDataURL(file);
  };

  // -----------------------------
  // Save profile
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    // User must exist
    if (!savedUser?.email) {
      alert("User session not found. Please login again.");
      navigate("/login");
      return;
    }

    // Name validation
    const cleanName = name.trim();

    if (!cleanName) {
      alert("Please enter your name.");
      return;
    }

    if (cleanName.length < 2) {
      alert("Name must be at least 2 characters.");
      return;
    }

    // Clean skills
    const cleanSkills = skills
      .filter(
        (skill) =>
          typeof skill === "string" &&
          skill.trim() !== ""
      )
      .map((skill) => skill.trim());

    // Remove duplicate skills
    const uniqueSkills = [
      ...new Map(
        cleanSkills.map((skill) => [
          skill.toLowerCase(),
          skill,
        ])
      ).values(),
    ];

    // Normalize email
    const normalizedEmail =
      String(savedUser.email)
        .trim()
        .toLowerCase();

    // -----------------------------
    // Updated user
    // -----------------------------
    const updatedUser = {
      ...savedUser,

      name: cleanName,

      email: normalizedEmail,

      bio: bio.trim(),

      location:
        location.trim() || "Afghanistan",

      image: image || "",

      skills: uniqueSkills,

      // Never accidentally change provider role
      role: savedUser.role || "provider",

      updatedAt: new Date().toISOString(),
    };

    // -----------------------------
    // Save current logged-in user
    // -----------------------------
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    // -----------------------------
    // Update users array
    // -----------------------------
    try {
      const savedUsers =
        localStorage.getItem("users");

      let users = [];

      if (savedUsers) {
        const parsedUsers =
          JSON.parse(savedUsers);

        if (Array.isArray(parsedUsers)) {
          users = parsedUsers;
        }
      }

      let userFound = false;

      const updatedUsers = users.map((user) => {
        if (
          user &&
          typeof user === "object" &&
          String(user.email || "")
            .trim()
            .toLowerCase() === normalizedEmail
        ) {
          userFound = true;

          return {
            ...user,
            ...updatedUser,
          };
        }

        return user;
      });

      // If user doesn't exist in users array,
      // add the current user.
      if (!userFound) {
        updatedUsers.push(updatedUser);
      }

      localStorage.setItem(
        "users",
        JSON.stringify(updatedUsers)
      );
    } catch (error) {
      console.error(
        "Failed to update users:",
        error
      );

      // Keep profile usable even if users
      // storage has malformed data.
    }

    // -----------------------------
    // Notify the application
    // -----------------------------
    window.dispatchEvent(
      new Event("profileUpdated")
    );

    window.dispatchEvent(
      new Event("authChange")
    );

    alert(
      "Profile updated successfully! ✅"
    );

    // -----------------------------
    // Go to provider profile
    // -----------------------------
    navigate(
      `/provider/${encodeURIComponent(
        normalizedEmail
      )}`
    );
  };

  // -----------------------------
  // No valid user
  // -----------------------------
  if (!savedUser?.email) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-container">
          <div className="edit-profile-header">
            <span>PROVIDER ACCOUNT</span>

            <h1>Edit Profile</h1>

            <p>
              Your session could not be found.
            </p>

            <button
              type="button"
              className="save-profile-btn"
              onClick={() => navigate("/login")}
            >
              Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">

        {/* HEADER */}
        <div className="edit-profile-header">
          <span>
            PROVIDER ACCOUNT
          </span>

          <h1>
            Edit Profile
          </h1>

          <p>
            Update your profile information
            and show your skills to customers.
          </p>
        </div>

        {/* FORM */}
        <form
          className="edit-profile-form"
          onSubmit={handleSubmit}
        >

          {/* PROFILE IMAGE */}
          <div className="profile-image-section">

            <div className="edit-profile-avatar">
              {image ? (
                <img
                  src={image}
                  alt={`${name || "Provider"} profile`}
                />
              ) : (
                name
                  .trim()
                  .charAt(0)
                  .toUpperCase() || "P"
              )}
            </div>

            <div>
              <label className="upload-btn">
                Choose Profile Photo

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              <small>
                JPG, PNG or WEBP • Max 2MB
              </small>
            </div>

          </div>

          {/* NAME */}
          <div className="form-group">
            <label>
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter your name"
              maxLength={80}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              value={
                savedUser.email || ""
              }
              disabled
            />
          </div>

          {/* BIO */}
          <div className="form-group">
            <label>
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              placeholder="Tell customers about yourself..."
              rows="5"
              maxLength={500}
            />
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="e.g. Kabul, Afghanistan"
              maxLength={100}
            />
          </div>

          {/* SKILLS */}
          <div className="form-group">
            <label>
              Skills
            </label>

            <div className="skill-input-row">

              <input
                type="text"
                value={skillInput}
                onChange={(e) =>
                  setSkillInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill..."
                maxLength={40}
              />

              <button
                type="button"
                onClick={addSkill}
                className="add-skill-btn"
              >
                + Add
              </button>

            </div>

            <div className="edit-skills-list">
              {skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="edit-skill-tag"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(skill)
                      }
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                )
              )}
            </div>

          </div>

          {/* BUTTONS */}
          <div className="edit-profile-actions">

            <button
              type="button"
              className="cancel-profile-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-profile-btn"
            >
              Save Profile →
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProfile;
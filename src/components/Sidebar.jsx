import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebar({ sidebarOpen }) {
  const user = useSelector((state) => state.auth.user);

  const baseMenus = [
    // Menu Profil Saya - ditambahkan paling atas
    { label: "Profil Saya", icon: "bi bi-person-circle", link: "/profile", type: "Umum" },

    { label: "Dashboard", icon: "bi bi-grid-fill", link: "/dashboard", type: "Umum" },
    { label: "Upload", icon: "bi bi-cloud-upload-fill", link: "/upload-stnk", type: "STNK" },
    { label: "Data Table", icon: "bi bi-card-list", link: "/data-stnk", type: "STNK" },
  ];

  // Tambahkan menu admin jika role admin/superadmin
  if (user?.role === "admin" || user?.role === "superadmin") {
    baseMenus.push(
      {
        label: "Registrasi Akun",
        icon: "bi bi-person-plus",
        link: "/admin/register",
        type: "Umum",
      },
      {
        label: "Daftar Akun",
        icon: "bi bi-people-fill",
        link: "/admin/users",
        type: "Umum",
      }
    );
  }

  const menus = baseMenus;
  const uniqueTypes = [...new Set(menus.map((item) => item.type))];

  const sidebarClasses = sidebarOpen
    ? "fixed top-0 left-0 z-40 h-screen pt-16 transition-all duration-300 transform w-18 bg-white border-r border-gray-200"
    : "fixed top-0 left-0 z-40 h-screen pt-16 transition-all duration-300 transform w-58 bg-white border-r border-gray-200";

  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="h-full pt-2 px-3 pb-4 overflow-y-auto bg-[#222831]">
        <ul className="font-medium">
          {uniqueTypes.map((type, typeIndex) => (
            <li key={`type-${typeIndex}`}>
              {!sidebarOpen && (
                <div className="mt-3 mb-2 text-[#609966] text-xs font-medium">
                  <span className="ms-2">{type}</span>
                </div>
              )}

              {menus
                .filter((item) => item.type === type)
                .map((item, itemIndex) => (
                  <NavLink
                    key={`item-${typeIndex}-${itemIndex}`}
                    to={item.link}
                    className={({ isActive }) =>
                      `flex items-center mb-1 p-2 text-[#F2F2F2] rounded hover:bg-[#393E46] group ${
                        isActive ? "bg-[#393E46] font-semibold" : ""
                      } ${sidebarOpen ? "justify-center" : ""}`
                    }
                    title={sidebarOpen ? item.label : ""}
                  >
                    <i className={`${item.icon} text-lg`}></i>
                    {!sidebarOpen && (
                      <span className="flex-1 ms-3 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                    {!sidebarOpen && item.badge && (
                      <span
                        className={`inline-flex items-center justify-center px-2 ms-3 text-sm font-medium rounded-full ${
                          item.badgeColor || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;

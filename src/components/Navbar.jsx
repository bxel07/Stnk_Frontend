import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/slices/loginSlice";
import Swal from "sweetalert2";

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin logout?",
      text: "Kamu akan keluar dari akun ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb", // biru
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Logout"
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        Swal.fire("Berhasil", "Kamu telah logout.", "success");
        navigate("/");
      }
    });
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#3F4E4F]">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start rtl:justify-end">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
            >
              <span className="sr-only">
                {sidebarOpen ? "Close sidebar" : "Open sidebar"}
              </span>
              {sidebarOpen ? (
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              )}
            </button>

            <h1 className="font-semibold flex items-center ms-2 text-[#F2F2F2]">
              STNK Reader
            </h1>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-white bg-blue-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import { Link, NavLink, Outlet } from "react-router-dom"
import { useAuth } from "../../auth/Auth"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
  const { signOut } = useAuth()
  
  const linkStyles = {
    "nonactive": "flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95",
    "active": "flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg bg-lightgray ease duration-150 active:scale-95"
  }
  return (
    <>
      <nav class="fixed bottom-0 w-full md:w-64 bg-background overflow-hidden md:h-full border-t md:border-r md:border-t-0 border-neutral-700 px-1 md:p-2.5">
        <Link to="/" class="hidden md:flex items-center justify-left p-4 gap-3 ease duration-150 active:scale-95">
          <img src="icons/Snapshare-Purple.png" className="w-5"></img>
          <h1 className="font-space-mono font-bold text-2xl text-accent">Snapshare</h1>
        </Link>
        <div className="justify-between justify-items-stretch w-full flex flex-row md:flex-col md:py-4 gap-2">
          <NavLink to="/" className={ ({ isActive }) => isActive ? linkStyles.active : linkStyles.nonactive }>
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-home"></i></span>
            <span className="hidden md:block">Home</span>
          </NavLink>
          <NavLink to="/something" className={ ({ isActive }) => isActive ? linkStyles.active : linkStyles.nonactive }>
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-search"></i></span>
            <span className="hidden md:block">Search</span>
          </NavLink>
          <NavLink to="/something" className={ ({ isActive }) => isActive ? linkStyles.active : linkStyles.nonactive }>
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-chat"></i></span>
            <span className="hidden md:block">Messages</span>
          </NavLink>
          <NavLink to="/create-post" className={ ({ isActive }) => isActive ? linkStyles.active : linkStyles.nonactive }>
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-add-to-queue"></i></span>          
            <span className="hidden md:block">Create</span>
          </NavLink>
          <NavLink to="/something" className={ ({ isActive }) => isActive ? linkStyles.active : linkStyles.nonactive }>
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-bell"></i></span>
            <span className="hidden md:block">Notifications</span>
          </NavLink>
          <NavLink to="/profile" className={ ({ isActive }) => isActive ? linkStyles.active : linkStyles.nonactive }>
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-user"></i></span>
            <span className="hidden md:block">Profile</span>
          </NavLink>
          <Link onClick={signOut} className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-log-out"></i></span>
            <span className="hidden md:block">Sign Out</span>
          </Link>
        </div>
      </nav>
      <Outlet />
    </>
  )
}
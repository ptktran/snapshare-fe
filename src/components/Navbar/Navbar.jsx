import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../../auth/Auth"

export default function Navbar() {
  const { signOut } = useAuth()  
  return (
    <>
    <main className="h-screen flex">
      <nav class="fixed bottom-0 md:relative md:flex-col w-full md:w-64 bg-background overflow-hidden md:h-full border-t md:border-r md:border-t-0 border-neutral-700 px-1 md:p-2.5">
        <Link to="/" class="hidden md:flex items-center justify-left p-4 gap-3 ease duration-150 active:scale-95">
          <img src="icons/Snapshare-Purple.png" className="w-5"></img>
          <h1 className="font-space-mono font-bold text-2xl text-accent">Snapshare</h1>
        </Link>
        <div className="justify-between justify-items-stretch w-full flex flex-row md:flex-col md:py-4 gap-2">
          <Link to="/" className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-home"></i></span>
            <span className="hidden md:block">Home</span>
          </Link>
          <Link className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-search"></i></span>
            <span className="hidden md:block">Search</span>
          </Link>
          <Link className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-chat"></i></span>
            <span className="hidden md:block">Messages</span>
          </Link>
          <Link to="/create-post" className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-add-to-queue"></i></span>          
            <span className="hidden md:block">Create</span>
          </Link>
          <Link className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-bell"></i></span>
            <span className="hidden md:block">Notifications</span>
          </Link>
          <Link to="/profile" className="flex items-center justify-center md:justify-normal w-full py-1 md:py-0 md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-user"></i></span>
            <span className="hidden md:block">Profile</span>
          </Link>
          <Link onClick={signOut} className="hidden md:flex bottom-0 items-center justify-center md:justify-normal w-full md:rounded-lg hover:bg-lightgray ease duration-150 active:scale-95">
            <span class="inline-flex items-center justify-center h-12 w-12 text-2xl md:text-xl text-foreground"><i class="bx bx-log-out"></i></span>
            <span className="hidden md:block">Sign Out</span>
          </Link>
        </div>
      </nav>
      <Outlet />
    </main>
    </>
  )
}
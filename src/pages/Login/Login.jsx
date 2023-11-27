import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from "../../auth/Auth"

export default function Login() {
  return (
    <>
      <main className="h-screen flex flex-col md:flex-row justify-center items-center bg-gradient-to-r from-neutral-950 via-zinc-900 to-zinc-800">
        <section className="flex flex-col justify-center items-center  w-full h-full">
          <div className="">
            <div className="flex items-center gap-3">
              <img src="icons/Snapshare-Purple.png" className="w-10"></img>
              <h1 className="font-space-mono font-bold text-5xl text-accent">Snapshare</h1>
            </div>
            <p className="text-lg text-foreground">Stay connected with friends and loved ones wherever you are</p>
          </div>
        </section>
        <section className="flex flex-col justify-center items-center w-full h-full">
          <div className="w-full sm:max-w-[600px] p-10 rounded-2xl bg-neutral-950 font-space-mono">
            <Auth supabaseClient={supabase} 
              providers={['google', 'discord']}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#0a0a0a',
                      brandAccent: '#89AAE6',
                      brandButtonText: '#e5e5e5',
                      inputText: "#e5e5e5",
                      inputBorder: "#27272a",
                      inputLabelText: '#e5e5e5',
                      defaultButtonBackground: '#27272a',
                      defaultButtonBackgroundHover: '#2b2b2e',
                      defaultButtonBorder: 'transparent',
                      defaultButtonText: '#e5e5e5',
                      dividerBackground: '#27272a',
                    },
                  },
                },
              }}   
            />
          </div>
        </section>
      </main>
    </>
  )
}
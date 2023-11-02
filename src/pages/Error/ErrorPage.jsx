export default function ErrorPage({ errorCode }) {
  return (
    <main className="ml-0 md:ml-64 bg-background h-screen flex flex-col justify-center items-center">
      <h1 className="text-9xl font-black text-accent">{errorCode}!</h1>
      <h1 className="text-xl font-bold">Sorry, this page isn't available ˙◠˙</h1>
      <h2 className="text-lg text-center">The link you followed may be broken, or the page may have been removed</h2>
    </main>
  )
}
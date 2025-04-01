export const Navbar = () => {
  return (
    <>
      <div className="h-[20%] flex justify-center items-center">
        <div className="w-[50%] flex justify-evenly items-center p-4 rounded-lg shadow-2xl">
          <div className="text-3xl font-bold">BüféGO</div>
          <div className="">
            <a href="/login">Bejelentkezés</a> 
            <a href="/register" className="p-2 m-2 bg-[var(--orange)] rounded">Regisztráció</a>
          </div>
        </div>
      </div>
    </>
  );
};

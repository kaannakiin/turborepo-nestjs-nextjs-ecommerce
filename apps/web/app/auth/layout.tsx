import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-20 border-b border-red-500"></header>

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md py-5">{children}</div>
      </main>

      <footer className="h-30 border-t border-red-500"></footer>
    </div>
  );
};

export default AuthLayout;

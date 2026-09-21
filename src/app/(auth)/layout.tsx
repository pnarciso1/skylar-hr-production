import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-8 md:px-10">
      <Image
        src="/brand/logo.png"
        alt="Skylar"
        width={44}
        height={40}
        priority
        className="mb-10"
      />
      {children}
    </main>
  );
}

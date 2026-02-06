import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Remember Her
        </h1>
        <p className="mb-8 text-sm text-[#a3a3a3]">
          Your theater memory, organized.
        </p>
        <SignUp afterSignOutUrl="/" />
      </div>
    </div>
  );
}

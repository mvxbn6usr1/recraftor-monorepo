import { LoginForm } from "@/components/auth/login-form";
import { RootLayout } from "@/components/layout/root-layout";

export default function LoginPage() {
  return (
    <RootLayout className="bg-white">
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="mx-auto w-full max-w-md space-y-6 px-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </RootLayout>
  );
} 
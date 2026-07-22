import Link from "next/link";
import Image from "next/image";
import { RegisterFlow } from "./RegisterFlow";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <Link
        href="/"
        className="mb-8 flex justify-center"
      >
        <Image
          src="/mindfulness-logo.png"
          alt="Mindfulness Indonesia"
          width={180}
          height={45}
          priority
        />
      </Link>
      <RegisterFlow />
    </div>
  );
}

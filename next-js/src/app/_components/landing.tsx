import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";

export function Landing() {
  return (
    <>
      <main className="container my-12 px-4 md:px-6">
        <section className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Collaborate on your shopping lists.
            </h2>
            <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Shop together with your family or friends and manage shared
              shopping lists in real time. No more doubling up on items or
              forgetting the milk.
            </p>
          </div>
          <Link href="/api/auth/signin">
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Log in with Google
            </Button>
          </Link>
        </section>
      </main>
    </>
  );
}

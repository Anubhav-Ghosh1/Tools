import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function LoginPage() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/"
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-neutral-950 border border-neutral-800 shadow-2xl rounded-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-neutral-400",
            socialButtonsBlockButton:
              "border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white",
            dividerLine: "bg-neutral-800",
            dividerText: "text-neutral-600",
            formFieldInput:
              "bg-neutral-900 border-neutral-700 text-white focus:border-emerald-500",
            footerActionLink: "text-emerald-400 hover:text-emerald-300",
            identityPreviewEditButton: "text-emerald-400",
            formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500",
          },
        }}
      />
    </div>
  );
}

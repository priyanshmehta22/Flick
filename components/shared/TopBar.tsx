import { OrganizationSwitcher, SignOutButton, SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { dark } from "@clerk/themes";

async function TopBar() {
  return (
    <nav className="topbar">
      <Link className="flex gap-4 items-center" href="/">
        <Image src="/assets/logo.png" alt="logo" width={28} height={28} />
        <p className="text-heading3-bold text-light-1 max-xs:hidden">Flick</p>
      </Link>
      <div className="flex items-center gap-1">
        <div className="block md:hidden">
          <SignedIn>
            {" "}
            {/*this code will only show when user is signedIN */}
            <SignOutButton>
              <div className="flex cursor-pointer ">
                <Image
                  src="/assets/logout.svg"
                  width={24}
                  height={24}
                  alt="logout"
                />
              </div>
            </SignOutButton>
          </SignedIn>
        </div>
        <OrganizationSwitcher
          appearance={{
            baseTheme: dark,
            elements: {
              organisationSwitchTrigger: "py-2 px-4 ",
            },
          }}
        />
      </div>
    </nav>
  );
}

export default TopBar;

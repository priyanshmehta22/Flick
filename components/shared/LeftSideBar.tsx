"use client";

import Link from "next/link";
import { sidebarLinks } from "../../constants/index";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation"; //tells us about the current url we are on
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";

async function LeftSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  // const { userId } = useAuth();

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;
          // if (link.route === "/profile") {
          //   link.route = `${link.route}/${userId}`;
          // }
          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                width={24}
                height={24}
                alt={link.label}
              />
              <p className="text-light-1 max-lg:hidden">{link.label}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 px-6">
        <SignedIn>
          {" "}
          {/*this code will only show when user is signedIN */}
          <SignOutButton
            signOutCallback={() => {
              router.push("/sign-in"); // once signout is clicked it will redirect to signin, this is a callback function
            }}
          >
            <div className="flex cursor-pointer gap-4 p-4">
              <Image
                src="/assets/logout.svg"
                width={24}
                height={24}
                alt="logout"
              />
              <p className="text-light-2 max-lg:hidden ">Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
}

export default LeftSideBar;

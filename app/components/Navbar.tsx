"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCart } from "@/app/context/CartContext";

type NavbarProps = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFounder: boolean;
};

const BRAND_NAME = "Niivora";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Shop", href: "/products" },
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Journal", href: "/#journal" },
];

export default function Navbar({
  isAuthenticated,
  isAdmin,
  isFounder,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef<HTMLLIElement>(null);

  const { items } = useCart();

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close profile dropdown on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const handleSignOut = async () => {
    closeProfile();
    closeMenu();

    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <>
      {/* ==================== NAVBAR ==================== */}

      <nav className="flex h-20 items-center justify-between px-5 lg:px-20">
        {/* Hamburger - mobile only */}
        <button
          type="button"
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex cursor-pointer text-offwhite transition-colors duration-200 hover:text-gold lg:hidden"
        >
          {isOpen ? (
            <X size={22} strokeWidth={1.5} />
          ) : (
            <Menu size={22} strokeWidth={1.5} />
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex flex-col items-center gap-1 leading-none"
        >
          <span className="font-playfair text-xl uppercase tracking-wide text-offwhite md:text-2xl">
            {BRAND_NAME}
          </span>

          <span className="font-jost text-[10px] uppercase tracking-[0.25em] text-warmgrey">
            Hair Oil
          </span>
        </Link>

        {/* Nav Links - desktop only */}
        <ul className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="font-jost text-[13px] uppercase tracking-[0.12em] text-offwhite transition-colors duration-200 hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Profile + Cart */}
        <ul className="flex items-center gap-5">
          {/* Cart */}
          <li>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative inline-flex text-offwhite transition-colors duration-200 hover:text-gold"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold font-jost text-[10px] font-semibold text-espresso">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>

          {/* Profile - always visible, auth or not */}
          <li ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={isProfileOpen}
              onClick={() => setIsProfileOpen((open) => !open)}
              className="inline-flex cursor-pointer text-offwhite transition-colors duration-200 hover:text-gold"
            >
              <UserRound size={19} strokeWidth={1.5} />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-8 z-50 w-56 border border-bronze bg-espresso py-2 shadow-lg">
                {isAuthenticated ? (
                  <>
                    <div className="border-b border-bronze px-4 py-3">
                      <p className="font-jost text-[11px] uppercase tracking-[0.12em] text-warmgrey">
                        Account
                      </p>

                      {isFounder && (
                        <p className="mt-1 font-jost text-xs text-gold">
                          Founder
                        </p>
                      )}
                    </div>

                    <Link
                      href="/account"
                      onClick={closeProfile}
                      className="block px-4 py-3 font-jost text-[12px] uppercase tracking-widest text-offwhite transition-colors duration-200 hover:bg-charcoal hover:text-gold"
                    >
                      View Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={closeProfile}
                      className="block px-4 py-3 font-jost text-[12px] uppercase tracking-widest text-offwhite transition-colors duration-200 hover:bg-charcoal hover:text-gold"
                    >
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeProfile}
                        className="block px-4 py-3 font-jost text-[12px] uppercase tracking-widest text-gold transition-colors duration-200 hover:bg-charcoal hover:text-offwhite"
                      >
                        Admin Panel
                      </Link>
                    )}

                    <div className="my-1 border-t border-bronze" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full cursor-pointer px-4 py-3 text-left font-jost text-[12px] uppercase tracking-widest text-offwhite transition-colors duration-200 hover:bg-charcoal hover:text-gold"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeProfile}
                    className="block px-4 py-3 font-jost text-[12px] uppercase tracking-widest text-offwhite transition-colors duration-200 hover:bg-charcoal hover:text-gold"
                  >
                    Login
                  </Link>
                )}
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* ==================== MOBILE MENU OVERLAY ==================== */}

      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ease-in-out lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ==================== MOBILE MENU PANEL ==================== */}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-espresso transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end px-6 pt-6">
          <button
            type="button"
            aria-label="Close Menu"
            onClick={closeMenu}
            className="inline-flex cursor-pointer text-offwhite transition-colors duration-200 hover:text-gold"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <ul className="flex flex-col gap-6 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.label} className="border-b border-bronze pb-4">
              <Link
                href={link.href}
                onClick={closeMenu}
                className="font-jost text-sm uppercase tracking-[0.12em] text-offwhite transition-colors duration-200 hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

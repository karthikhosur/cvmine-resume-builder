// components/Navbar.js
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Navbar = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
      setLoading(false); // Set loading to false after checking user
    };

    checkUser();

    // Listen for changes in authentication state
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
      <Link href="/">
          <img src="/logo.png" alt="Logo" className="h-11" />
        </Link>
      </div>
      <div className="flex-none">
        {loading ? (
          <div className="btn btn-ghost">Loading...</div>
        ) : (
          !user ? (
            <>
              <Link href="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link href="/signup" className="btn btn-ghost">
                Signup
              </Link>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src="/user.png" alt="User Avatar" className="pr-3" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/profile" className="justify-between">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="justify-between">
                    Settings
                  </Link>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <button onClick={handleSignOut}>Sign Out</button>
                </li>
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Navbar;

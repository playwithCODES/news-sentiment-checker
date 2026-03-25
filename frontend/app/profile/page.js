"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import api from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl p-6">
        <div className="card rounded-2xl p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">Profile</h1>

          {user ? (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </main>
    </div>
  );
}
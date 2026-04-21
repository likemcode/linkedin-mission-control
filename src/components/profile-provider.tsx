"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiPath } from "@/lib/routes";

export type Profile = {
  id?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  profilePicture?: string;
};

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
};

const ProfileContext = createContext<ProfileContextValue>({ profile: null, loading: true });

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiPath("/api/profile"))
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          // Normalize Maton API / LinkedIn v2 profile response if necessary
          setProfile({
            firstName: data.firstName || data.localizedFirstName,
            lastName: data.lastName || data.localizedLastName,
            headline: data.headline,
            profilePicture: data.profilePicture?.displayImage || data.profilePicture,
          });
        }
      })
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProfileContext value={{ profile, loading }}>
      {children}
    </ProfileContext>
  );
}
